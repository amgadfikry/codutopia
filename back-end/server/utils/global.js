// This class contains the global functions that can be used in the whole project.
class Global {
  // function convert array in data to string
  static prepareDataToRedis(data) {
    const newData = {};
    for (const key in data) {
      if (key !== 'password') {
        if (key === '_id') {
          newData.id = data[key].toString();
        } else if (Array.isArray(data[key])) {
          newData[key] = JSON.stringify(data[key]);
        } else {
          newData[key] = data[key];
        }
      }
    }
    return newData;
  }
}

// export the Global class
export default Global;
