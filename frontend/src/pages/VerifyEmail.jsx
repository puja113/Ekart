import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import axios from "axios"

const VerifyEmail = () => {
  const navigate = useNavigate()
  const { token } = useParams()
  const [status, setStatus] = useState("⏳ Verifying email...")

  const verifyEmail = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/v1/user/verify",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      if (res.data.success) {
        setStatus("✅ Email verified successfully")

        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch (error) {
      console.error(error)
      setStatus("❌ Verification failed. Please try again.")
    }
  }

  useEffect(() => {
    verifyEmail()
  }, [token])

  return (
    <div className="relative w-full h-[760px] bg-pink-100 overflow-hidden">
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-6 rounded-2xl shadow-md text-center w-[90%] max-w-md">
          <h2 className="text-xl font-semibold text-gray-800">{status}</h2>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
