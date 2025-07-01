module.exports = {
  root: true,
  extends: '@react-native',
  // 'module'과 'require'를 전역 변수로 인식시켜 에러를 없앨 수 있습니다.
  globals: {
    module: 'readonly',
    require: 'readonly',
  },
};
