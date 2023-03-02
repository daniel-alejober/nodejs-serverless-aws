const currentDate = () => {
  let cDate = new Date();
  const currentD = cDate.toISOString().split("T")[0];
  return currentD;
};

export default currentDate;
