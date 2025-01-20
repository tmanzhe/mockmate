**MockMate: Your AI-Powered Interview Preparation Tool**

MockMate is an advanced AI-driven application tailored to enhance interview preparation by delivering real-time feedback and an immersive, interactive experience. Using voice recognition and AI, MockMate simulates live interviews with customized questions based on user-selected topics. 

At the conclusion of each interview, users can explore "Perspective Mode," a unique feature where MockMate reveals simulated interviewer insights on their performance. This perspective highlights strengths and areas for improvement, offering actionable feedback to refine responses and presentation skills.

### **Key Features**
1. **Frontend**: Built with Next.js for a responsive user interface, styled using Tailwind CSS.
2. **Backend API**: Handles core functionality including:
   - Dynamic question generation using GPT.
   - Session data storage via Prisma and PostgreSQL (RDS/Supabase).
3. **Database**: PostgreSQL manages structured data, with Prisma ORM for seamless integration.
4. **Authentication**: Secured with NextAuth.js for user management.

### **Workflow Overview**
1. **Interview Setup**:
   - Users submit parameters (topic, style, etc.) to customize the interview.
   - MockMate introduces itself and initiates the session.

2. **Interview Flow** (Two Modes):
   - **Interactive Q&A (Mode A)**:
     - MockMate generates and asks tailored questions (technical, behavioral, creative).
     - Users respond naturally via voice, converted to text.
     - MockMate continues in a conversational manner, expanding on responses.
   - **Perspective Mode (Mode B)**:
     - MockMate generates live insights (hidden from the user) based on their responses, analyzing strengths and weaknesses.
     - Users can pause the interview to access these insights via a dedicated button.
     - Switching back to Mode A resumes the interview.

3. **Session Completion**:
   - After all questions are answered, MockMate wraps up the session.
   - Two chatlogs are stored:
     - **Mode A**: Full conversation (questions, user responses, AI feedback).
     - **Mode B**: MockMate's real-time simulated thoughts.

4. **Session Storage**:
   - Chatlogs and feedback are saved for review, allowing users to track their progress and refine their skills.

### **Backend Workflow Setup**
1. **User Query Submission**:
   - Parameters for interview style and layout are sent to MockMate.
2. **Dynamic Response Handling**:
   - MockMate introduces itself and starts the session.
   - Two branches operate simultaneously:
     - **Visible Branch**: Interactive Q&A with real-time feedback.
     - **Hidden Branch**: Simulated interviewer thoughts generated alongside.
3. **Mode Switching**:
   - Buttons allow toggling between interactive Q&A (Mode A) and Perspective Mode (Mode B).
4. **Session Finalization**:
   - MockMate concludes the interview, saving chatlogs for review.

check it out here lol: https://dorahacks.io/buidl/21737
