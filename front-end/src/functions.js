const searchPattern = (pattern, string) => {
  return (pattern.test(string));
}

export const samilarData = (newData, oldData) => {
  const errorDic = {};
  for (const key in newData) {
    if (newData[key] !== oldData[key]) {
      return errorDic;
    }
  }
  errorDic['all'] = 'Same data without changes';
  return errorDic;
}

export const checkDataError = (data, exception) => {
  const userPattern = /^[^!\s\W]{5,}$/;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  for (let [key, value] of Object.entries(data)) {
    if (!value && !exception.includes(key)) {
      return 'Fill required field';
    }
    if ('fullName' === key) {
      const nameLength = value.length;
      if (nameLength < 8 || nameLength > 20) {
        return 'Name between 8 and 20 characters';
      }
    }
    if (key === 'userName' && !searchPattern(userPattern, value)) {
      return 'User name at least 5 characters and no space or special characters';
    }
    if (key === 'email' && !searchPattern(emailPattern, value)) {
      return "Invalid email address";
    }
  }
  return ""
}