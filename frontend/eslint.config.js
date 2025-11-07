import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineEslintConfig, globalIgnores } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineEslintConfig({
  globalIgnores: globalIgnores('dist'),

  files: ['**/*.{ts,tsx}'], 

  extends: [
    js.configs.recommended,
    ...tseslint.configs.recommended, 
    reactHooks.configs['recommended-latest'],
    reactRefresh.configs.vite,
  ],

  languageOptions: {
    ecmaVersion: 2020,
    globals: globals.browser,

    // 配置 TypeScript 解析器
    parser: tseslint.parser, 
    parserOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      ecmaFeatures: { jsx: true },
      project: './tsconfig.json', 
    },
  },

  rules: {
    'no-unused-vars': 'off', 
    '@typescript-eslint/no-unused-vars': [ 
      'error', 
      { 'varsIgnorePattern': '^[A-Z_]' }
    ],
  },
});