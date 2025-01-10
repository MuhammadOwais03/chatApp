import { useEffect, useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/userAuthStore";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const fileInputRef = useRef(null);
  const { sendMessage, selectedUser } = useChatStore();
  const {authUser} = useAuthStore()


  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
  
    // Filter valid image files
    const validFiles = files.filter((file) => file.type.startsWith("image/"));
  
    if (validFiles.length !== files.length) {
      toast.error("Some files were not valid images and were skipped.");
    }
  
    // Update state with the valid files
    setImagePreviews((prev) => [...prev, ...validFiles]);
  };
  
  

  useEffect(()=>{
      console.log(imagePreviews)
  }, [imagePreviews])

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && imagePreviews.length === 0) return;


    console.log(authUser._id)
    console.log(selectedUser._id)


    let formdata = new FormData()

    try {

      formdata.append("text", text.trim())
      formdata.append("senderId", authUser._id)
      formdata.append("chatWithId", selectedUser._id)

      
      imagePreviews.forEach((file) => {
        console.log("File:", file); // Ensure each file is valid
        formdata.append("images", file);
      });

      console.log(imagePreviews)

      await sendMessage(formdata);

      // Clear form
      setText("");
      setImagePreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreviews.length > 0 && (
        <div className="mb-3 flex items-center gap-2 flex-wrap">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative">
              <img
                src={URL.createObjectURL(preview)}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
                flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            multiple
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreviews.length > 0 ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && imagePreviews.length === 0}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
