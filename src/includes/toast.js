import { useToast } from "vue-toast-notification";
import 'vue-toast-notification/dist/theme-bootstrap.css';
// import 'vue-toast-notification/dist/theme-default.css';

const toast = () => {
   const toast = useToast({
      position: "top",
      duration: 8000,
   });

   return toast;
}

export default toast;
