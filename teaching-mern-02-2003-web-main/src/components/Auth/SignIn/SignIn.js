import React from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import {
  EMAIL_RULE,
  PASSWORD_RULE,
  FIELD_REQUIRED_MESSAGE,
  PASSWORD_RULE_MESSAGE,
  EMAIL_RULE_MESSAGE,
  fieldErrorMessage
} from 'utilities/validators'
import { signInUserAPI } from 'redux/user/userSlice'
import { useDispatch } from 'react-redux'

function SignIn() {
  const dispatch = useDispatch()
  let [searchParams] = useSearchParams()
  const registeredEmail = searchParams.get('registeredEmail')
  const verifiedEmail = searchParams.get('verifiedEmail')

  const { register, handleSubmit, formState: { errors } } = useForm()
  const navigate = useNavigate()

  const onSubmitSignIn = (data) => {
    toast.promise(dispatch(signInUserAPI(data)), { pending: 'Singing in...' })
      .then(res => {
        if (!res.error) navigate('/')
      })
  }

  return (
    <form className="auth__form form__sign-in" onSubmit={handleSubmit(onSubmitSignIn)}>
      <h2 className="auth__form__title">Sign In</h2>
      {registeredEmail && <div className='auth__form_message success'>
        <div>An email has been sent to <strong>{registeredEmail}</strong></div>
        <div>Please check and verify your account before login!</div>
      </div>}

      {verifiedEmail && <div className='auth__form_message success'>
        <div>Your email <strong>{verifiedEmail}</strong> has been verified.</div>
        <div>Please sign-in to enjoy our services! Thank you!</div>
      </div>}

      <div className="auth__form__input-field">
        <i className="fa fa-envelope"></i>
        <input
          type="text"
          placeholder="Email"
          // autoComplete='nope'
          {...register('email', {
            required: FIELD_REQUIRED_MESSAGE,
            pattern: {
              value: EMAIL_RULE,
              message: EMAIL_RULE_MESSAGE
            }
          })}
        />
      </div>
      {fieldErrorMessage(errors, 'email')}

      <div className="auth__form__input-field">
        <i className="fa fa-lock"></i>
        <input
          type="password"
          placeholder="Password"
          {...register('password', {
            required: FIELD_REQUIRED_MESSAGE,
            pattern: {
              value: PASSWORD_RULE,
              message: PASSWORD_RULE_MESSAGE
            }
          })}
        />
      </div>
      {fieldErrorMessage(errors, 'password')}

      <button className="auth__form__submit" type="submit">Login</button>
    </form>
  )
}

export default SignIn
