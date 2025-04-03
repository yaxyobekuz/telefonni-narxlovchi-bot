const use_calculate = (initial_amount) => {
  const calculate_percentage = (value) => {
    return initial_amount === 0 ? 0 : (value * initial_amount) / 100;
  };

  return { calculate_percentage };
};

module.exports = use_calculate;
