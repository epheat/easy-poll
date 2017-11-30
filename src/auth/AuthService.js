// https://auth0.com/docs/quickstart/spa/vuejs/01-login
// https://auth0.com/docs/quickstart/spa/vuejs

import auth0 from 'auth0-js';
import { AUTH_CONFIG } from './auth0-config'
import router from './../router'
import EventBus from './../utils/EventBus.js'
import base64 from 'base-64'

export default class AuthService {

  constructor() {
    this.login = this.login.bind(this);
    this.setSession = this.setSession.bind(this)
    this.logout = this.logout.bind(this)
    this.isAuthenticated = this.isAuthenticated.bind(this)
    this.getUserInfo = this.getUserInfo.bind(this)

    this.auth0 = new auth0.WebAuth({
      domain: AUTH_CONFIG.domain,
      clientID: AUTH_CONFIG.clientID,
      redirectUri: AUTH_CONFIG.callbackUrl,
      audience: AUTH_CONFIG.apiUrl,
      responseType: 'token id_token',
      scope: 'openid'
    })
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult)
        router.replace('/')
      } else if (err) {
        router.replace('/')
        console.log(err)
        alert(`Error: ${err.error}. Check the console for further details.`)
      }
    })
  }

  setSession(authResult) {
    // Set the time that the access token will expire at
    let expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    )
    localStorage.setItem('access_token', authResult.accessToken)
    localStorage.setItem('id_token', authResult.idToken)
    localStorage.setItem('expires_at', expiresAt)

    // get the userID
    var decodeThis = authResult.idToken.split(".")[1];
    var userProperties = JSON.parse(atob(decodeThis));
    // console.log(userProperties);

    EventBus.$emit('authChange', { authenticated: true, nickname: userProperties.nickname, accountID: userProperties.sub, admin: userProperties.admin })
  }

  logout() {
    // Clear access token and ID token from local storage
    localStorage.removeItem('access_token')
    localStorage.removeItem('id_token')
    localStorage.removeItem('expires_at')
    this.userProfile = null
    EventBus.$emit('authChange', { authenticated: false })
    // navigate to the home route
    router.replace('/')
  }

  isAuthenticated() {
    // Check whether the current time is past the
    // access token's expiry time
    let expiresAt = JSON.parse(localStorage.getItem('expires_at'))
    return new Date().getTime() < expiresAt
  }

  getUserInfo(accessToken) {
    this.auth0.client.userInfo(accessToken, function(err, user) {
      console.log(user);
    })
  }

}
