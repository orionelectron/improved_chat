import React,{ useState} from "react";
import { ReactDOM } from "react";

function SelectUsername(){
    const [username, setUsername] = useState('');
    const ref = React.createRef();
    const onSubmitCallback = (e) => {
        const usernameValue = ref.current.value;
        setUsername((prevState) => {
            return username;
        });
    };
    return (
        <div>
            <form onSubmit={onSubmitCallback}>
                <input ref={ref} type="text" placeholder="Username"/>
                <button> Set Username </button>
            </form>
        </div>
    )
}

export default SelectUsername;