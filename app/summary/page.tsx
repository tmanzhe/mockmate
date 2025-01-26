export default function Summary() {
  return (
    <div></div>
  );
}

// "use client";

// import { useRouter } from "next/navigation";

// export default function Summary() {
//   const router = useRouter();

//   // Mock messages for the chatbox
//   // const [messages, setMessages] = useState([
//   //   { id: 1, text: "Great job on your interview!", sender: "AI Interviewer" },
//   //   { id: 2, text: "You answered all the questions confidently.", sender: "AI Interviewer" },
//   //   { id: 3, text: "Thank you!", sender: "You" },
//   // ]);

//   const handleLanding = () => {
//     router.push("/landing");
//   };

//   return (
//     <main className="gradient-background flex justify-center items-center h-screen w-full">
//       <div className="bg-black/80 rounded-3xl p-12 text-center w-full max-w-2xl shadow-2xl transform -translate-y-5">
//         <h1 className="text-[#F1DAC4] text-4xl font-bold mb-6">Interview Summary</h1>
//         <p className="text-[#A69CAC] text-lg mb-8 leading-relaxed">
//           You have completed your interview! Here&apos;s your feedback:
//         </p>

//         {/* Chatbox */}
//         <div className="bg-white/10 rounded-xl p-6 mb-8 max-h-96 overflow-y-auto">
//           {messages.map((message) => (
//             <div
//               key={message.id}
//               className={`
//                 ${message.sender === "You" ? "bg-[#161B33]" : "bg-[#474973]"}
//                 text-[#F1DAC4]
//                 px-4 py-3
//                 rounded-lg
//                 mb-3
//                 ${message.sender === "You" ? "text-right" : "text-left"}
//               `}
//             >
//               <div className="text-sm font-bold mb-1">{message.sender}</div>
//               <div className="text-base">{message.text}</div>
//             </div>
//           ))}
//         </div>

//         {/* Return Home Button */}
//         <button
//           onClick={handleLanding}
//           className="bg-[#161B33] text-[#F1DAC4] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#474973] transition-all"
//         >
//           Return Home
//         </button>
//       </div>
//     </main>
//   );
// }