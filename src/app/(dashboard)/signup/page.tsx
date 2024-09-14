import { SignupFormDemo } from '@/components/signup_dummy'
import { div } from 'framer-motion/client'
import React from 'react'

function Signup() {
  return (
    <div className='h-full bg-neutral-900'>
      <div>
        <SignupFormDemo/>
      </div>
    </div>
  )
}

export default Signup