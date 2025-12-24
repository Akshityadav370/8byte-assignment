//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    rules: {
      'sort-imports': 'off',
      '@typescript-eslint/array-type': 'off',
    },
  },
]
