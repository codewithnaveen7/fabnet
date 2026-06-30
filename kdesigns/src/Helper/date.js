export const convertDateToUTC = (value) => {
    return value
      ? new Date(
          new Date(Number(value)).getUTCMonth() +
            1 +
            "/" +
            new Date(Number(value)).getUTCDate() +
            "/" +
            new Date(Number(value)).getUTCFullYear()
        ).getTime()
      : null;
  };
  export const convertDateToUTCEpoch = (value) => {
    if (value && !isNaN(value.getTime())) {
      value = value.getTime();
      value = new Date(
        Date.UTC(
          new Date(value).getFullYear(),
          new Date(value).getMonth(),
          new Date(value).getDate()
        )
      );
      value = value.getTime();
    } else {
      value = '';
    }
    return value;
  };
  