// import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import apiEndpoints from "../config/api/endpoints"

// const baseQuery = fetchBaseQuery({baseUrl: 'http://127.0.0.1:8000'})

// export const apiSlice = createApi({
//     baseQuery,
//     tagTypes: ['User'],
//     endpoints: (build) => ({
//         login: build.mutation({
//             query: data => ({
//                 url: `/api/login_check`,
//                 body: data,
//                 method: 'POST'
//             })
//         }),
//         register: build.mutation({
//             query: data => ({
//                 url: `${apiEndpoints.userEndpoint}/register`,
//                 body: data,
//                 method: 'POST'
//             })
//         })
//     })
// })