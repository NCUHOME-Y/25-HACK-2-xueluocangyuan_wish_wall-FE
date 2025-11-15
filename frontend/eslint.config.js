import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefresh from 'eslint-plugin-react-refresh'; // <-- 确保这行被删除
import tseslint from 'typescript-eslint';

// ESLint 9+ Flat Config
export default tseslint.config(
  // 1) 全局忽略
  { ignores: ['dist'] },

  // 2) JS/TS 基础推荐
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  reactHooks.configs['recommended-latest'],
  // reactRefresh.configs.vite, // <-- 确保这行被删除

  // 3) 项目级配置
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: {
        // 启用类型感知规则（自动查找 tsconfig）
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: { jsx: true },
      },
    },
    rules: {
      // 交由 @typescript-eslint 处理未使用变量
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z_]' }
      ],
    },
  }
);