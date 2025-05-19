const use_user_state = (user) => {
  const get_state_name = () => user.state?.name || null;
  const get_state_data = () => user.state?.data || {};

  const update_state_name = (new_state_name) => {
    user.state.name = new_state_name;
    user.markModified("state.name");
  };

  const update_state_data = (key, value) => {
    user.state.data[key] = value;
    user.markModified("state.data");
  };

  const clear_state_data = () => {
    user.state.data = {};
    user.markModified("state.data");
  };

  const check_state_name = (state_name) => {
    return user.state.name && user.state.name === state_name;
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
