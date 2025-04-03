const use_user_state = (user) => {
  if (!user.state) user.state = { name: null, data: {} };

  const get_state_name = () => user.state.name;
  const get_state_data = () => user.state.data;

  const update_state_name = (new_state_name) => {
    if (user) user.state.name = new_state_name;
  };

  const update_state_data = (key, value) => {
    if (user) {
      if (!user.state.data) user.state.data = {};
      user.state.data[key] = value;
    }
  };

  const clear_state_data = () => {
    if (user) user.state.data = {};
  };

  const check_state_name = (state_name) => {
    return user ? user.state.name === state_name : false;
  };

  return {
    get_state_name,
    get_state_data,
    check_state_name,
    update_state_name,
    update_state_data,
    clear_state_data,
  };
};

module.exports = use_user_state;
