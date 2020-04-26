export const addActivity = (activity) => {
  return {
    type: 'ADD_ACTIVITY',
    activity
  }
}
export const deleteActivity = (id) => {
  return {
    type: 'DELETE_ACTIVITY',
    id
  }
}
export const modifyActivity = (activity) => {
  return {
    type: 'MODIFY_ACTIVITY',
    activity
  }
}