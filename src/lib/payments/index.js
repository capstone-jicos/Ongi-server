"use strict";

import fs from "fs";
import axios from "axios";
import apiCredential from "../../config/iamport";
import token from "../../config/iamport-token";
import unixtimestamp from "unix-timestamp";

class Payments {
  constructor() {
    axios.defaults.baseURL = "https://api.iamport.kr";
    this.header = {
      "Authorization": "Bearer "
    };
  }

  async _getToken() {
    console.debug(token);

    return new Promise((resolve, reject) => {
      if (unixtimestamp.now() > token.expired_at) {
        // TODO Exception 처리 필요 (catch)
        axios.post("/users/getToken", apiCredential).then(response => {
          fs.writeFileSync(__dirname.concat("/../../config/iamport-token.json"), JSON.stringify(response.data.response));

          return resolve(response.data.response.access_token);
        }).catch(error => {
          console.debug(error.response, null);
          return reject(error);
        });
      } else {
        return resolve(token.access_token);
      }
    });
  }

  requestPayment(payload, callback) {
    this._getToken().then(access_token => {
      let authHeader = this.header;

      authHeader.Authorization += access_token;
      console.debug(authHeader);

        axios.post("/subscribe/payments/onetime", payload, {headers: authHeader}).then(response => {
          debugger;
          const {data} = response;
          // TODO Response 형태 참고해서 저장할 것들 정해주기
          // 동일 merchant_uid 로 요청보낸 경우에는 상태코드가 200으로 넘어와서 예외처리 필요
          if (data.code === 0) {
            callback(true, data.response);
          } else {
            callback(false, data.message);
          }
        }).catch(error => {
          console.debug(error.response);
          callback(false, error);
        });
      });
  }

  cancelPayment(payload, callback) {
    this._getToken().then(access_token => {
      let authHeader = this.header;

      authHeader.Authorization += access_token;
      console.debug(authHeader);

        axios.post("/payments/cancel", payload, {headers: authHeader}).then(response => {
          debugger;
          const {data} = response;

          if (data.code === 0) {
            callback(true, data.response);
          } else {
            console.log(data.message);
            callback(false, data.message);
          }          
          
        }).catch(error => {
          console.debug(error.response);
          callback(false, error);
        })
    })
  }
}

export default Payments;
