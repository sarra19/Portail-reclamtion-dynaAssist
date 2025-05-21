import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import Context from "context";
import { toast } from "react-toastify";
import SummaryApi from "api/common";

export default function OTPInput() {
  const [OTPinput, setOTPinput] = useState(["", "", "", ""]);
  const history = useHistory();
  const { Email, otp } = useContext(Context);
  const [timerCount, setTimer] = useState(60);
  const [disable, setDisable] = useState(true);

  useEffect(() => {
    if (!Email || otp === undefined) {
      console.error("Email or OTP is undefined!");
      return;
    }

    let interval = setInterval(() => {
      setTimer((lastTimerCount) => {
        if (lastTimerCount <= 1) {
          clearInterval(interval);
          setDisable(false);
        }
        return lastTimerCount <= 0 ? lastTimerCount : lastTimerCount - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [disable, Email, otp]);

  const handleInputChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // Valide seulement les chiffres
    if (value) {
      const newOTPinput = [...OTPinput];
      newOTPinput[index] = value;
      setOTPinput(newOTPinput);

      // Déplace automatiquement au champ suivant
      if (index < OTPinput.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const resendOTP = async () => {
    if (disable) return;

    try {
      const response = await fetch(SummaryApi.sendRecoveryEmail.url, {
        method: SummaryApi.sendRecoveryEmail.method,
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          OTP: otp,
          recipient_email: Email,
        }),
      });

      if (!response.ok) {
        throw new Error("Échec de l'envoi du nouvel OTP");
      }

      setDisable(true);
      toast.success("Un nouvel OTP a été envoyé avec succès à votre email.");
      setTimer(60);
    } catch (error) {
      toast.error(error);
    }
  };

  const verifyOTP = () => {
    if (parseInt(OTPinput.join("")) === otp) {
      history.push('/auth/reset');
    } else {
      toast.error(
        "The code you have entered is not correct. Please try again or resend the OTP."
      );
    }
  };

  return (
    <div className="container mx-auto px-4 h-full">
      <div className="flex content-center items-center justify-start h-full">
        <div className="w-full lg:w-4/12 px-4">
          <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-200 border-0">
            <div className="rounded-t mb-0 px-6 py-6 text-center">
              <h6 className="text-blueGray-500 text-sm font-bold">
                Vérification par OTP
              </h6>
              <div className="text-blueGray-400 text-center mb-3 font-bold">
                <small>Entrez le code envoyé à votre e-mail {Email}.</small>
              </div>
            </div>

            <div className="px-6 py-4 flex flex-col items-center">
              <div className="flex flex-row justify-between space-x-2">
                {OTPinput.map((value, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    maxLength="1"
                    type="text"
                    value={value}
                    onChange={(e) => handleInputChange(e, index)}
                    className="w-12 h-12 text-center mr-2 border rounded text-lg focus:ring focus:ring-blue-500"
                  />
                ))}
              </div>

              <div className="text-center mt-6 ">
                <button
                  onClick={verifyOTP}
                  className="bg-orange-dys text-white active:bg-blueGray-600 text-sm font-bold uppercase px-6 py-3 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 w-full ease-linear transition-all duration-150"
                  type="button"
                >
                  Vérifier
                </button>
              </div>
            </div>

            <div className="text-center py-4 mb-2">
              <p className="text-sm text-blueGray-400">
                Vous n'avez pas reçu le code ?{" "}
                <button
                  type="button"
                  disabled={disable}
                  onClick={resendOTP}
                  className={`${
                    disable ? "text-gray-500" : "text-orange-dys"
                  } underline`}
                >
                  {disable ? `Renvoyer OTP in ${timerCount}s` : "Renvoyer OTP"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}