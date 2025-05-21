import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { toast } from 'react-toastify';
import SummaryApi from 'api/common';

const ROLE = {
    ADMIN: 0,
    CLIENT: 1,
    FOURNISSEUR: 2,
};

const ChangeUserRole = ({
    name,
    email,
    role,
    userId,
    onClose, // Nouvelle prop pour fermer le modal
    callFunc,
}) => {
    const [userRole, setUserRole] = useState(role);

    const handleOnChangeSelect = (e) => {
        setUserRole(e.target.value);
        console.log(e.target.value);
    };

    const updateUserRole = async () => {
        const fetchResponse = await fetch(SummaryApi.updateUserRole.url, {
            method: SummaryApi.updateUserRole.method,
            credentials: 'include',
            headers: {
                "content-type": "application/json"
            },
            body: JSON.stringify({
                No_: userId,
                Role: userRole
            })
        });

        const responseData = await fetchResponse.json();

        if (responseData.success) {
            toast.success(responseData.message);
            onClose(); // Fermer le modal après succès
            callFunc(); // Rafraîchir les données dans le composant parent
        } else {
            toast.error(responseData.error || "Erreur lors de la mise à jour du rôle");
        }

        console.log("role updated", responseData);
    };

    return (
        <div className='fixed top-0 bottom-0 left-0 right-0 w-full h-full z-10 flex justify-center items-center bg-slate-200 bg-opacity-50'>
            <div className='mx-auto bg-white border border-orange-dys shadow-xl rounded-lg p-8 w-96 max-w-md relative'>
                {/* Bouton de Fermeture */}
                <button
                    className='absolute top-2 right-2 text-gray-500 hover:text-gray-700'
                    onClick={onClose} // Appeler la fonction onClose pour fermer le modal
                >
                    <IoMdClose size={24} />
                </button>

                {/* Contenu du Modal */}
                <h1 className='mt-6 pb-4 text-lg text-orange-dys font-semibold'>Changer le Rôle d'utilisateur</h1>
                <p>Nom : {name}</p>
                <p>Email : {email}</p>

                <div className='flex items-center justify-between my-4'>
                    <p>Role :</p>
                    <select
                        className='border px-4 py-1'
                        value={userRole}
                        onChange={handleOnChangeSelect}
                    >
                        {Object.entries(ROLE).map(([key, value]) => (
                            <option value={value} key={value}>
                                {key.charAt(0) + key.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Bouton de Confirmation */}
                <button
                    className='w-fit mx-auto block py-1 px-3 rounded-full bg-orange-dys text-white hover:bg-orange-dys'
                    onClick={updateUserRole}
                >
                    Changer le Rôle
                </button>
            </div>
        </div>
    );
};

export default ChangeUserRole;