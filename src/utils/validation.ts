// 表单验证工具
export interface ValidationRule {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean | string;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule | ValidationRule[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: { [key: string]: string[] };
}

export function validateField(value: any, rules: ValidationRule | ValidationRule[]): string[] {
  const ruleArray = Array.isArray(rules) ? rules : [rules];
  const errors: string[] = [];

  for (const rule of ruleArray) {
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(rule.message || '此字段为必填项');
      continue;
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(rule.message || `至少需要 ${rule.minLength} 个字符`);
    }

    if (value && rule.maxLength && value.length > rule.maxLength) {
      errors.push(rule.message || `最多允许 ${rule.maxLength} 个字符`);
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(rule.message || '格式不正确');
    }

    if (value && rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true && typeof customResult === 'string') {
        errors.push(customResult);
      } else if (customResult === false) {
        errors.push(rule.message || '验证失败');
      }
    }
  }

  return errors;
}

export function validateForm(data: any, schema: ValidationSchema): ValidationResult {
  const errors: { [key: string]: string[] } = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const fieldErrors = validateField(data[field], rules);
    if (fieldErrors.length > 0) {
      errors[field] = fieldErrors;
      isValid = false;
    }
  }

  return { isValid, errors };
}

// 常见验证规则
export const commonValidation = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: '请输入有效的邮箱地址'
  },
  phone: {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入有效的手机号码'
  },
  password: {
    minLength: 8,
    message: '密码至少需要8个字符'
  },
  username: {
    pattern: /^[a-zA-Z0-9_]{3,20}$/,
    message: '用户名只能包含字母、数字和下划线，3-20个字符'
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[\u4e00-\u9fa5a-zA-Z\s]+$/,
    message: '姓名只能包含中英文字母和空格，2-50个字符'
  }
};

// 验证装饰器
export function withValidation<T extends any[], R>(
  validate: (args: T) => ValidationResult,
  originalFn: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    const validation = validate(args);
    if (!validation.isValid) {
      const firstError = Object.values(validation.errors)[0]?.[0];
      throw new Error(firstError || '验证失败');
    }
    return originalFn(...args);
  };
}