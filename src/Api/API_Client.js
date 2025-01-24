import axios from "axios"



 export const axiosClient= axios.create({
  baseURL:"http://localhost:3000/api/"

}
  
)
const tenant= "tenant1";
//  the tenent has to bought  from the storage
export const  TenatApi=axios.create(
  {  baseURL:`http://${tenant}localhost:3000`}
)