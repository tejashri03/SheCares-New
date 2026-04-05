import { useState } from "react";

function Nutrition(){

const [form,setForm] = useState({
weight:"",
pimples:"",
irregular:"",
fastfood:"",
exercise:""
});

const [diet,setDiet] = useState([]);

const handleChange = (e)=>{
setForm({...form,[e.target.name]:Number(e.target.value)});
};

const getDiet = async ()=>{

const response = await fetch("http://127.0.0.1:5000/nutrition",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(form)
});

const data = await response.json();

setDiet(data.diet);

};

return(

<div className="container">

<h1 className="title">🥗 Nutrition Recommendation</h1>

<div className="card">

<input placeholder="Weight Gain (1/0)" name="weight" onChange={handleChange}/>
<input placeholder="Pimples (1/0)" name="pimples" onChange={handleChange}/>
<input placeholder="Irregular Periods (1/0)" name="irregular" onChange={handleChange}/>
<input placeholder="Fast Food (1/0)" name="fastfood" onChange={handleChange}/>
<input placeholder="Exercise (1/0)" name="exercise" onChange={handleChange}/>

<button onClick={getDiet}>Get Diet Plan</button>

<ul style={{marginTop:"20px"}}>
{diet.map((item,index)=>(
<li key={index}>{item}</li>
))}
</ul>

</div>

</div>

);

}

export default Nutrition;