import { useState } from "react";

function PCOSForm(){

const [form,setForm] = useState({
age:"",
bmi:"",
irregular:"",
cycle:"",
missed:"",
weight:"",
hair:"",
pimples:"",
skin:"",
fastfood:"",
exercise:""
});

const [result,setResult] = useState("");

const handleChange=(e)=>{
setForm({...form,[e.target.name]:e.target.value});
};

const predictPCOS = async()=>{

const features=[
Number(form.age),
Number(form.bmi),
Number(form.irregular),
Number(form.cycle),
Number(form.missed),
Number(form.weight),
Number(form.hair),
Number(form.pimples),
Number(form.skin),
Number(form.fastfood),
Number(form.exercise)
];

const response = await fetch("http://127.0.0.1:5000/predict",{

method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({features})

});

const data = await response.json();

setResult(data.prediction===1 ? "⚠️ PCOS Risk Detected" : "✅ Low Risk");

};

return(

<div style={{maxWidth:"400px",margin:"auto"}}>

<input placeholder="Age" name="age" onChange={handleChange}/>
<input placeholder="BMI" name="bmi" onChange={handleChange}/>
<input placeholder="Irregular periods (1/0)" name="irregular" onChange={handleChange}/>
<input placeholder="Cycle length" name="cycle" onChange={handleChange}/>
<input placeholder="Missed periods (1/0)" name="missed" onChange={handleChange}/>
<input placeholder="Weight gain (1/0)" name="weight" onChange={handleChange}/>
<input placeholder="Hair growth (1/0)" name="hair" onChange={handleChange}/>
<input placeholder="Pimples (1/0)" name="pimples" onChange={handleChange}/>
<input placeholder="Skin darkening (1/0)" name="skin" onChange={handleChange}/>
<input placeholder="Fast food (1/0)" name="fastfood" onChange={handleChange}/>
<input placeholder="Exercise (1/0)" name="exercise" onChange={handleChange}/>

<br/><br/>

<button onClick={predictPCOS}>Predict</button>

<h2>{result}</h2>

</div>

)

}

export default PCOSForm