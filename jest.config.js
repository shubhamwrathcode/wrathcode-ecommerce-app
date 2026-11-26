module.exports = {
  preset: '@react-native/jest-preset',
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' },
  setupFiles: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|@react-native-vector-icons|@react-native-async-storage|react-native-image-picker|react-redux|redux-persist|@reduxjs|immer)/)',
  ],
  collectCoverageFrom: ['src/utils/**/*.ts', 'src/services/**/*.ts', 'src/store/**/*.ts'],
};
