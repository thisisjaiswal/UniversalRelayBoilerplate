// @flow

import bcrypt from 'bcrypt'
import bodyParser from 'body-parser'
import express from 'express'
import jwt from 'jwt-simple'

import authExtensions from '../_configuration/urb-base-server/authExtensions'
import delayPromise from '../urb-base-universal/delayPromise'
import getNewUser from '../_configuration/urb-base-server/graphql/model/getNewUser'
import logServerRequest from './logServerRequest'
import { getObjectManager } from './graphql/ObjectManager'
import { requestLoggerAuth } from '../_configuration/urb-base-server/requestLoggers'

import { validateEmail } from '../urb-base-universal/validation'

// Read environment
require('dotenv').load()

const serverAuth = express()

serverAuth.use(bodyParser.json())
serverAuth.use((req, res, next) => logServerRequest(req, res, next, requestLoggerAuth))

//

async function login(req, res) {
  const objectManager = await getObjectManager(req, res)
  if (objectManager.siteInformation) {
    let User_AccountName = req.body.User_AccountName.toLowerCase()
    let User_AccountPassword = req.body.User_AccountPassword

    await delayPromise(1000) // Wait for a second to slow down a possible potential force attack

    try {
      const arr_Users = await objectManager.getObjectList('User', {
        User_AccountName: User_AccountName,
      })

      if (arr_Users.length == 0) res.status(401).json({ error: '💔  Incorrect user' })
      else {
        const a_User = arr_Users[0]

        if (
          await new Promise(resolve =>
            bcrypt.compare(
              User_AccountPassword,
              a_User.User_AccountPassword,
              (err, passwordMatch) => resolve(passwordMatch),
            ),
          )
        ) {
          res.codeFoundriesInjected = { user: a_User }

          // User has authenticated correctly thus we create a JWT token
          const token = jwt.encode({ user_id: a_User.id }, process.env.JWT_SECRET)

          res.cookie('UserToken1', token, { httpOnly: true })
          res.json({ success: true, UserToken2: a_User.UserToken2 })
        } else res.status(401).json({ error: '💔  Incorrect password' })
      }
    } catch (error) {
      res.status(401).json({ error: error.message })
    }
  }
}
serverAuth.post('/login', login)

//

async function createuser(req, res) {
  const objectManager = await getObjectManager(req, res)
  if (objectManager.siteInformation) {
    const User_AccountName = req.body.User_AccountName.toLowerCase()
    const User_AccountPassword = req.body.User_AccountPassword

    try {
      const arr_Users = await objectManager.getObjectList('User', {
        User_site_id: objectManager.siteInformation.site_id,
        User_AccountName: User_AccountName,
      })

      if (arr_Users.length > 0) throw new Error('💔  User account already exists')

      const User_PasswordHash = await new Promise(resolve =>
        bcrypt.hash(User_AccountPassword, 8, (err, hash) => resolve(hash)),
      )

      // If account name looks like email address, use it as email
      const accountNameIsValidEmail = validateEmail(User_AccountName)
      const User_Email = accountNameIsValidEmail ? User_AccountName : ''

      // Create the user object
      const a_User = Object.assign(getNewUser(objectManager.siteInformation.site_id), {
        UserToken2:
          Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2),
        User_AccountName: User_AccountName,
        User_AccountPassword: User_PasswordHash,
        User_DisplayName: User_AccountName,
        User_Email: User_Email,
      })

      // Add user to database
      await objectManager.add('User', a_User)

      res.codeFoundriesInjected = { user: a_User }

      // User has been created thus we create a JWT token
      const UserToken1 = jwt.encode({ user_id: a_User.id }, process.env.JWT_SECRET)

      // Set cookie and return
      res.cookie('UserToken1', UserToken1, { httpOnly: true })
      res.json({ success: true })
    } catch (error) {
      res.status(401).json({ error: '' + error.message })
    }
  }
}
serverAuth.post('/createuser', createuser)

//

serverAuth.post('/logout', (req, res) => {
  res.cookie('UserToken1', '', { httpOnly: true, expires: new Date(1) })
  res.json({ success: true })
})

// Add extensions - custom configurations
authExtensions(serverAuth)

export default serverAuth
