import React, { useEffect, useState } from 'react'
import { useSearchParams, Navigate } from 'react-router-dom'
import LoadingSpinner from 'components/Common/LoadingSpinner'
import { verifyUserAPI } from 'actions/ApiCall'

function AccountVerification() {
  let [searchParams] = useSearchParams()
  // const email = searchParams.get('email')
  // const token = searchParams.get('token')
  const { email, token } = Object.fromEntries([...searchParams])
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (email && token) {
      // call api
      verifyUserAPI({ email, token }).then(() => setVerified(true))
    }
  }, [email, token])

  if (!email || !token) {
    return <Navigate to='/404' />
  }

  if (!verified) {
    return <LoadingSpinner caption='Verifying...' />
  }

  return <Navigate to={`/signIn?verifiedEmail=${email}`} />
}

export default AccountVerification
