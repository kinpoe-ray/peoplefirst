import { Flame } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-dark-surface border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ember to-violet flex items-center justify-center">
                <Flame className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">PeopleFirst</span>
            </div>
            <p className="text-sm text-dark-text-tertiary">
              少一些规划，多一些尝试
            </p>
            <p className="text-xs text-dark-text-tertiary">
              先试试，再决定
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">快速链接</h3>
            <ul className="space-y-2">
              <FooterLink href="/contents" text="职业内容库" />
              <FooterLink href="/tasks" text="技能试验场" />
              <FooterLink href="/stories" text="迷茫者故事" />
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">资源</h3>
            <ul className="space-y-2">
              <FooterLink href="#" text="使用指南" />
              <FooterLink href="#" text="常见问题" />
              <FooterLink href="#" text="联系我们" />
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4">法律</h3>
            <ul className="space-y-2">
              <FooterLink href="#" text="服务条款" />
              <FooterLink href="#" text="隐私政策" />
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-dark-border">
          <p className="text-xs text-dark-text-tertiary text-center">
            © 2025 PeopleFirst. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, text }: { href: string; text: string }) {
  return (
    <li>
      <a
        href={href}
        className="text-sm text-dark-text-tertiary hover:text-pathBlue transition-colors duration-200"
      >
        {text}
      </a>
    </li>
  );
}
