//updata data
import axios from "axios";
import { showAlert } from "./alert";

export const updateSettings = async (data, type) => {
  try {
    const url =
      type === `password`
        ? `/api/v1/users/updateMyPassword`
        : `/api/v1/users/updateMe`;

    //`${window.location.protocol}://${window.location.hostname}:${window.location.port}/api/v1/users/logout`,

    const res = await axios({
      method: `PATCH`,
      url,
      data,
    });

    if (res.data.status === `success`) {
      showAlert(`success`, `${type.toUpperCase()} Successfully updated!`);
    }
  } catch (err) {
    showAlert(`error`, `invalid email or name`);
  }
};
