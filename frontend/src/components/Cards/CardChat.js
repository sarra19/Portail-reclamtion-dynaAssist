import React from "react";


export default function CardChat() {
    return (
        <>

            <div class="w-full mt-8 bg-green-chat"></div>


            <div class="container mx-auto margin-top-chat">
                <div class="py-6 h-screen flex justify-center items-center">
                    <div class="flex border border-orange rounded shadow-lg w-2/3">

                        <div class="w-1/3 border flex flex-col">

                            <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                                <div>
                                    <img class="w-10 h-10 rounded-full" alt="team" src={require("assets/img/team-1-800x800.jpg")} />
                                </div>

                                <div class="flex">
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#727A7E" d="M12 20.664a9.163 9.163 0 0 1-6.521-2.702.977.977 0 0 1 1.381-1.381 7.269 7.269 0 0 0 10.024.244.977.977 0 0 1 1.313 1.445A9.192 9.192 0 0 1 12 20.664zm7.965-6.112a.977.977 0 0 1-.944-1.229 7.26 7.26 0 0 0-4.8-8.804.977.977 0 0 1 .594-1.86 9.212 9.212 0 0 1 6.092 11.169.976.976 0 0 1-.942.724zm-16.025-.39a.977.977 0 0 1-.953-.769 9.21 9.21 0 0 1 6.626-10.86.975.975 0 1 1 .52 1.882l-.015.004a7.259 7.259 0 0 0-5.223 8.558.978.978 0 0 1-.955 1.185z"></path></svg>
                                    </div>
                                    <div class="ml-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path opacity=".55" fill="#263238" d="M19.005 3.175H4.674C3.642 3.175 3 3.789 3 4.821V21.02l3.544-3.514h12.461c1.033 0 2.064-1.06 2.064-2.093V4.821c-.001-1.032-1.032-1.646-2.064-1.646zm-4.989 9.869H7.041V11.1h6.975v1.944zm3-4H7.041V7.1h9.975v1.944z"></path></svg>
                                    </div>
                                    <div class="ml-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".6" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div class="py-2 px-2 bg-grey-lightest">
                                <input type="text" class="w-full px-2 py-2 text-sm" placeholder="Search or start new chat" />
                            </div>

                            <div class="bg-grey-lighter flex-1 overflow-auto">
                                <div class="px-3 flex items-center bg-grey-light cursor-pointer">
                                    <div>
                                        <img class="h-12 w-12 rounded-full" alt="img1"
                                            src={require("assets/img/team-1-800x800.jpg")} />
                                    </div>
                                    <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
                                        <div class="flex items-bottom justify-between">
                                            <p class="text-grey-darkest">
                                                New Movie! Expendables 4
                                            </p>
                                            <p class="text-xs text-grey-darkest">
                                                12:45 pm
                                            </p>
                                        </div>
                                        <p class="text-grey-dark mt-1 text-sm">
                                            Get Andrés on this movie ASAP!
                                        </p>
                                    </div>
                                </div>

                                <div class="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer">
                                    <div>
                                        <img class="h-12 w-12 rounded-full" alt="img1"
                                            src="https://www.famousbirthdays.com/headshots/russell-crowe-6.jpg" />
                                    </div>
                                    <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
                                        <div class="flex items-bottom justify-between">
                                            <p class="text-grey-darkest">
                                                Russell Crowe
                                            </p>
                                            <p class="text-xs text-grey-darkest">
                                                12:45 pm
                                            </p>
                                        </div>
                                        <p class="text-grey-dark mt-1 text-sm">
                                            Hold the line!
                                        </p>
                                    </div>
                                </div>
                                <div class="bg-white px-3 flex items-center hover:bg-grey-lighter cursor-pointer">
                                    <div>
                                        <img class="h-12 w-12 rounded-full" alt="img1"
                                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGpYTzuO0zLW7yadaq4jpOz2SbsX90okb24Z9GtEvK6Z9x2zS5" />
                                    </div>
                                    <div class="ml-4 flex-1 border-b border-grey-lighter py-4">
                                        <div class="flex items-bottom justify-between">
                                            <p class="text-grey-darkest">
                                                Tom Cruise
                                            </p>
                                            <p class="text-xs text-grey-darkest">
                                                12:45 pm
                                            </p>
                                        </div>
                                        <p class="text-grey-dark mt-1 text-sm">
                                            Show me the money!
                                        </p>
                                    </div>
                                </div>

                            </div>

                        </div>


                        <div class="w-2/3 border flex flex-col">

                            <div class="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                                <div class="flex items-center">
                                    <div>
                                        <img class="w-10 h-10 rounded-full" alt="img1" src={require("assets/img/team-1-800x800.jpg")} />
                                    </div>
                                    <div class="ml-4">
                                        <p class="text-grey-darkest">
                                            New Movie! Expendables 4
                                        </p>
                                        <p class="text-grey-darker text-xs mt-1">
                                            Andrés, Tom, Harrison, Arnold, Sylvester
                                        </p>
                                    </div>
                                </div>

                                <div class="flex">
                                    <div>
                                        {/* appel video */}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
                                            <path fill="#263238" fill-opacity=".5" d="M17 10.5V7c0-.8-.7-1.5-1.5-1.5h-9C5.7 5.5 5 6.2 5 7v10c0 .8.7 1.5 1.5 1.5h9c.8 0 1.5-.7 1.5-1.5v-3.5l4 3V7.5l-4 3z"></path>
                                        </svg>
                                    </div>
                                    <div class="ml-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".5" d="M1.816 15.556v.002c0 1.502.584 2.912 1.646 3.972s2.472 1.647 3.974 1.647a5.58 5.58 0 0 0 3.972-1.645l9.547-9.548c.769-.768 1.147-1.767 1.058-2.817-.079-.968-.548-1.927-1.319-2.698-1.594-1.592-4.068-1.711-5.517-.262l-7.916 7.915c-.881.881-.792 2.25.214 3.261.959.958 2.423 1.053 3.263.215l5.511-5.512c.28-.28.267-.722.053-.936l-.244-.244c-.191-.191-.567-.349-.957.04l-5.506 5.506c-.18.18-.635.127-.976-.214-.098-.097-.576-.613-.213-.973l7.915-7.917c.818-.817 2.267-.699 3.23.262.5.501.802 1.1.849 1.685.051.573-.156 1.111-.589 1.543l-9.547 9.549a3.97 3.97 0 0 1-2.829 1.171 3.975 3.975 0 0 1-2.83-1.173 3.973 3.973 0 0 1-1.172-2.828c0-1.071.415-2.076 1.172-2.83l7.209-7.211c.157-.157.264-.579.028-.814L11.5 4.36a.572.572 0 0 0-.834.018l-7.205 7.207a5.577 5.577 0 0 0-1.645 3.971z"></path></svg>
                                    </div>
                                    <div class="ml-6">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".6" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div class="flex-1 overflow-auto bg-white1-chat">
                                <div class="py-2 px-3">

                                    <div class="flex justify-center mb-2">
                                        <div class="rounded py-2 px-4 bg-white2-chat">
                                            <p class="text-sm uppercase">
                                                February 20, 2018
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex justify-center mb-4">
                                        <div class="rounded py-2 px-4 bg-white3-chat">
                                            <p class="text-xs">
                                                Messages to this chat and calls are now secured with end-to-end encryption. Tap for more info.
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex mb-2">
                                        <div class="rounded py-2 px-3 bg-white4-chat">
                                            <p class="text-sm text-teal">
                                                Sylverter Stallone
                                            </p>
                                            <p class="text-sm mt-1">
                                                Hi everyone! Glad you could join! I am making a new movie.
                                            </p>
                                            <p class="text-right text-xs text-grey-dark mt-1">
                                                12:45 pm
                                            </p>
                                        </div>
                                    </div>


                                    <div class="flex mb-2">
                                        <div class="rounded py-2 px-3 bg-white4-chat">
                                            <p class="text-sm text-orange">
                                                Harrison Ford
                                            </p>
                                            <p class="text-sm mt-1">
                                                Again?
                                            </p>
                                            <p class="text-right text-xs text-grey-dark mt-1">
                                                12:45 pm
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex mb-2">
                                        <div class="rounded py-2 px-3 bg-white4-chat">
                                            <p class="text-sm text-orange">
                                                Russell Crowe
                                            </p>
                                            <p class="text-sm mt-1">
                                                Is Andrés coming for this one?
                                            </p>
                                            <p class="text-right text-xs text-grey-dark mt-1">
                                                12:45 pm
                                            </p>
                                        </div>
                                    </div>



                                    <div class="flex justify-end mb-2">
                                        <div class="rounded py-2 px-3 bg-orangelight-dys2">
                                            <p class="text-sm mt-1">
                                                Hi guys.
                                            </p>
                                            <p class="text-right text-xs text-grey-dark mt-1">
                                                12:45 pm
                                            </p>
                                        </div>
                                    </div>

                                    <div class="flex justify-end mb-2">
                                        <div class="rounded py-2 px-3 bg-orangelight-dys2">
                                            <p class="text-sm mt-1">
                                                Count me in
                                            </p>
                                            <p class="text-right text-xs text-grey-dark mt-1">
                                                12:45 pm
                                            </p>
                                        </div>
                                    </div>


                                </div>
                            </div>

                            <div class="bg-grey-lighter px-4 py-4 flex items-center">
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path opacity=".45" fill="#263238" d="M9.153 11.603c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962zm-3.204 1.362c-.026-.307-.131 5.218 6.063 5.551 6.066-.25 6.066-5.551 6.066-5.551-6.078 1.416-12.129 0-12.129 0zm11.363 1.108s-.669 1.959-5.051 1.959c-3.505 0-5.388-1.164-5.607-1.959 0 0 5.912 1.055 10.658 0zM11.804 1.011C5.609 1.011.978 6.033.978 12.228s4.826 10.761 11.021 10.761S23.02 18.423 23.02 12.228c.001-6.195-5.021-11.217-11.216-11.217zM12 21.354c-5.273 0-9.381-3.886-9.381-9.159s3.942-9.548 9.215-9.548 9.548 4.275 9.548 9.548c-.001 5.272-4.109 9.159-9.382 9.159zm3.108-9.751c.795 0 1.439-.879 1.439-1.962s-.644-1.962-1.439-1.962-1.439.879-1.439 1.962.644 1.962 1.439 1.962z"></path></svg>
                                </div>
                                <div class="flex-1 mx-4">
                                    <input class="w-full border rounded px-2 py-2" type="text" />
                                </div>
                                <div>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fill-opacity=".45" d="M11.999 14.942c2.001 0 3.531-1.53 3.531-3.531V4.35c0-2.001-1.53-3.531-3.531-3.531S8.469 2.35 8.469 4.35v7.061c0 2.001 1.53 3.531 3.53 3.531zm6.238-3.53c0 3.531-2.942 6.002-6.237 6.002s-6.237-2.471-6.237-6.002H3.761c0 4.001 3.178 7.297 7.061 7.885v3.884h2.354v-3.884c3.884-.588 7.061-3.884 7.061-7.885h-2z"></path></svg>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
