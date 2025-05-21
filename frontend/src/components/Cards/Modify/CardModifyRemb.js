
export default function CardModifyRemb() {


    return (
        <>
            <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-100 border-0">
                <div className="flex-auto px-4 lg:px-10 py-10 pt-0">
                    <h6 className="text-blueGray-700 text-xl mt-12 font-bold flex justify-center">
                        Modifier un remboursement
                    </h6>

                    <form>

                        <div className="flex flex-wrap">
                            <div className="w-full lg:w-6/12 px-4">
                                <div className="relative w-full mb-3">
                                    <label
                                        className="block uppercase text-blueGray-600 text-xs font-bold mt-6 mb-2"
                                        htmlFor="grid-password"
                                    >
                                        Montant
                                    </label>
                                    <input
                                        type="number"
                                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                    />
                                </div>
                            </div>
                            <div className="w-full lg:w-6/12 px-4">
                                <div className="relative w-full mb-3 mt-6">
                                    <label
                                        className="block uppercase text-blueGray-600 text-xs font-bold mb-2"
                                        htmlFor="grid-password"
                                    >
                                        Date prévu de Remboursement
                                    </label>
                                    <input
                                        type="date"
                                        className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                    />
                                </div>
                            </div>

                            <div className="w-full lg:w-6/12 px-4">
                                <div className="relative w-full mb-3">
                                    <label
                                        className="block uppercase text-blueGray-600 text-xs font-bold mt-6 mb-2"
                                        htmlFor="grid-password"
                                    >
                                        Statut
                                    </label>
                                    <select
                    className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-600 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  >
                    <option value="en attente">En attente</option>
                    <option value="traité">Traité</option>
                    <option value="non traité">Non Traité</option>

                  </select>
                                </div>
                            </div>
                        </div>



                        <div className="rounded-t bg-white mb-0 px-6 py-6">
                            <div className="text-center flex justify-end">
                                <button
                                    className="bg-orange-dys text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-6 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                                    type="button"
                                >
                                    Modifier
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
