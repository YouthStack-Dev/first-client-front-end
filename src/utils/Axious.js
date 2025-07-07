import axios from 'axios';
import Cookies from 'js-cookie';

export const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) =>
  async ({ url, method, data, params }) => {
    try {
      const token = Cookies.get("auth_token"); // 👈 get token from cookies

      console.log("🔸 Axios Request →", {
        url: baseUrl + url,
        method,
        data,
        params,
      });

      // const result = await axios({
      //   url: baseUrl + url,
      //   method,
      //   data,
      //   params,
      //   withCredentials: true, // needed if your backend checks cookies/sessions too
      //   headers: {
      //     Authorization: token ? `Bearer ${token}` : undefined,
      //     'Content-Type': 'application/json',
      //   },
      // });

      console.log("✅ Axios Response →", result.data);

      return { data: result.data };
    } catch (error) {
      // console.error("❌ Axios Error →", {
      //   status: error.response?.status,
      //   data: error.response?.data,
      //   message: error.message,
      // });

      return {
        error: {
          status: error.response?.status || 500,
          data: error.response?.data || error.message,
        },
      };
    }
  };
