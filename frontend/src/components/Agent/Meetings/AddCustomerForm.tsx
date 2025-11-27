import { XMarkIcon } from "@heroicons/react/24/outline"
import { useRouter } from "next/navigation";

interface AddCustomerFormProps {
    onClose: () => void
}

export const AddCustomerForm: React.FC<AddCustomerFormProps> = ({
    onClose
}) => {
    const router = useRouter();
    return (
        <div className="flex fixed top-0 left-0 w-screen bg-black/50 h-screen items-center justify-center">
            <div className="relative rounded-[20px] bg-white flex flex-col items-center justify-center h-[20%] w-[70%]">
                <XMarkIcon onClick={onClose} className="absolute top-4 right-4 z-10 cursor-pointer"/>
                <h1 className="w-[70%] absolute text-center top-4">Looks Like You Haven&apos;t Added Any Customers</h1>
                <button onClick={() => {router.push("/agent/customers"); onClose()}} className="cursor-pointer pt-5 pb-5 pr-10 pl-10 absolute bottom-4 rounded-[5px] bg-[#1e41f1] text-white">Add Customers First</button>
            </div>
        </div>
    )
}