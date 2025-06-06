module.exports = {
    extends: 'next/core-web-vitals',
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn', // Downgrade from error to warning
      '@typescript-eslint/no-explicit-any': 'warn', // Downgrade from error to warning
      'react-hooks/exhaustive-deps': 'warn', // Already a warning, but you can customize
    },
  };