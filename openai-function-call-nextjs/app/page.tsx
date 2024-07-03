"use client"

import { useEffect, useRef, useState } from "react"
import { getCookie } from 'cookies-next';
import { ChatGPTMessage } from "@/types/openai"
import ChatInput from "@/components/chat-input"
import ChatBox from "@/components/chatbox"
import ChatMessage from "@/components/chat-message"
import Dialog from "./Dialog";
import moment from 'moment'
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
type Props = {
  data: any,
  onClose_data: () => void,
  onOk_data: (reponse: any) => void,
}
function _RenderData({ data, onClose_data, onOk_data }: Props) {

  const [content, setContent] = useState(data.content);
  const [body, setBody] = useState(data.body);
  const [startDate, setStartDate] = useState(new Date());
  useEffect(() => {
    console.log("datadata", data)
    startDate

    if (moment(data.body, 'DD/MM/YYYY').isValid()) {
      const IsoDateTo = moment(data.body, 'DD/MM/YYYY').format('YYYY-MM-DD[T]HH:mm:ss');
      // console.log("Hợp lệ")
      setStartDate(new Date(IsoDateTo))
    } else {
      // console.log("Không Hợp lệ")
      setStartDate(new Date())
    }
  }, [data])
  async function onClose() {
    // console.log("Modal has closed")
    onClose_data()
  }

  async function onOk() {
    // console.log("Ok was clicked")
    let reponse = {
      content: content,
      body: body,
      name_funtion: "test"
    }
    onOk_data(reponse)
  }
  return (

    <Dialog title="Tạo đơn phép" onClose={onClose} onOk={onOk}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>

        <div >
          <span>Lý do nghỉ phép:</span>
          <input style={{ width: '60%' }}
            value={content} // ...force the input's value to match the state variable...
            onChange={e => setContent(e.target.value)} // ... and update the state variable on any edits!
          />
        </div>

        <div >
          <span>Ngày nghỉ phép:</span>
          <DatePicker dateFormat="dd/M/yyyy" selected={startDate} onChange={(date: any) => setStartDate(date)} />
          {/* <input
            value={body} // ...force the input's value to match the state variable...
            onChange={e => setBody(e.target.value)} // ... and update the state variable on any edits!
          /> */}
        </div>

      </div>

      {/* <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Veniam eligendi odio ipsa nostrum dolores voluptas architecto tempore nulla voluptatibus vel, placeat explicabo exercitationem id officia laborum doloremque blanditiis earum accusamus.</p> */}
    </Dialog>

  )
}

export default function IndexPage() {
  const messageListRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatGPTMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [isShowDialog, setShowDialog] = useState(false)
  const [data_donphep, set_DataDonPhep] = useState<any>()
  // const functionCallMessage: ChatGPTMessage = {
  //   role: "assistant",
  //   content: `Tôi có thể giúp được gì cho  bạn`,
  // }
  // setMessages([...messages, functionCallMessage])

  async function onClose() {

    setShowDialog(false)
    console.log("Modal has closed")
  }

  async function onOk(reponse: any) {
    setShowDialog(false)
    console.log("reponsereponse", reponse)
    const functionCallDonPhep: ChatGPTMessage = {
      role: "assistant",
      content: `tạo đơn phép thành công.`,
    }
    setMessages([...messages, functionCallDonPhep])
    setTimeout(() => {


      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    }, 100);
    console.log("Ok was clicked")
  }

  useEffect(() => {

    const functionCallMessage: ChatGPTMessage = {
      role: "assistant",
      content: process.env.NEXT_PUBLIC_MESS ?? "",
    }
    setMessages([...messages, functionCallMessage])
  }, []);
  const sendMessageHandler = async (message: string) => {
    const messagesToSend: ChatGPTMessage[] = [
      ...messages,
      { role: "user", content: message },
    ]

    setMessages(messagesToSend)
    setTimeout(() => {


      messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
    }, 100);
    try {
      setIsSending(true)
      const response = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: messagesToSend,
        }),
      })
      const data = await response.json()

      // console.log('message', message)
      // console.log('data call api', data)
      // Check if it's a function call
      if (data?.function_call) {

        const functionCall = data.function_call
        console.log('functionCall', functionCall)
        const access_token = getCookie('sso_token'); // => 'value'
        switch (functionCall.name) {
          case "taodonphep":
            var datafuntion = JSON.parse(functionCall.arguments)
            // console.log('datafuntion', datafuntion)
            // console.log('functionCallarguments', datafuntion.content)
            // console.log('functionCallbody', datafuntion.body)
            // code block
            setShowDialog(true)

            set_DataDonPhep(datafuntion)
            // const functionCallDonPhep: ChatGPTMessage = {
            //   role: "assistant",
            //   content: `tạo đơn phép thành công.`,
            // }
            // setMessages([...messagesToSend, functionCallDonPhep])

            // setTimeout(() => {


            //   messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
            // }, 100);
            // console.log("action api tạo đơn phép 111")
            break;
          case "soluongphep":
            var content_data = "";
            // console.log("access_token", access_token)
            if (access_token) {



              const res = await fetch('https://jeehr-api.jee.vn/api/controllergeneral/GetListTypeLeaveByTitle', {
                method: 'GET',
                headers: {
                  'Content-type': 'application/json',
                  Authorization: `Bearer ${access_token}`,
                  'Access-Control-Allow-Origin': '*',
                  'Access-Control-Allow-Headers': 'Content-Type',
                },
              })

              const reponse = await res.json()
              if (reponse) {
                for (let i = 0; i < reponse.data.length; i++) {
                  // copyItems.push(items[i]);
                  content_data = content_data + "\n" + (i + 1) + "." + reponse.data[i].title + ":" + reponse.data[i].SoNgay + " ngày" + "\n"
                }
                // reponse.data.forEach((element:any) => {
                //   content=element.
                // });
              }
              console.log("reponse", reponse)
              const functionCallMessage: ChatGPTMessage = {
                role: "assistant",
                content: "Thông tin ngày phép của bạn:\n\n" + content_data
                // content: `Để phân quyền trong quản lý cuộc họp, bạn có thể thực hiện các bước sau:\n\n1. Đăng nhập vào hệ thống quản lý và chọn chức năng Phân quyền chức năng.\n2. Tạo nhóm phân quyền mới cho quản lý cuộc họp bằng cách nhấn vào nút \"Thêm mới\" và nhập tên nhóm.\n3. Sau đó, chọn menu chức năng cụ thể liên quan đến quản lý cuộc họp, ví dụ như \"Quản lý cuộc họp\".\n4. Để phân quyền cho nhân viên thao tác trên trang quản lý cuộc họp, bạn tick chọn vào ô bên trái của dòng thông tin tương ứng.\n5. Nếu bạn muốn người dùng chỉ được xem trang mà không thể thực hiện thay đổi, hãy tick vào ô bên phải.\n6. Nhấn nút lưu để hoàn tất phân quyền.\n7. Cuối cùng, thêm nhân viên vào nhóm người dùng đã tạo bằng cách chọn vào biểu tượng Danh sách nhóm người dùng và nhấn nút 'Thêm mới'.\n\nLưu ý rằng sau khi phân quyền, người dùng cần đăng xuất và đăng nhập lại để có hiệu lực phân quyền mới.
                // `,
              }
              setMessages([...messagesToSend, functionCallMessage])

              setTimeout(() => {
                messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
              }, 100);
            }
            else {
              const functionCallMessage: ChatGPTMessage = {
                role: "assistant",
                content: "Authentication 401 xác thực không chính xác"
                // content: `Để phân quyền trong quản lý cuộc họp, bạn có thể thực hiện các bước sau:\n\n1. Đăng nhập vào hệ thống quản lý và chọn chức năng Phân quyền chức năng.\n2. Tạo nhóm phân quyền mới cho quản lý cuộc họp bằng cách nhấn vào nút \"Thêm mới\" và nhập tên nhóm.\n3. Sau đó, chọn menu chức năng cụ thể liên quan đến quản lý cuộc họp, ví dụ như \"Quản lý cuộc họp\".\n4. Để phân quyền cho nhân viên thao tác trên trang quản lý cuộc họp, bạn tick chọn vào ô bên trái của dòng thông tin tương ứng.\n5. Nếu bạn muốn người dùng chỉ được xem trang mà không thể thực hiện thay đổi, hãy tick vào ô bên phải.\n6. Nhấn nút lưu để hoàn tất phân quyền.\n7. Cuối cùng, thêm nhân viên vào nhóm người dùng đã tạo bằng cách chọn vào biểu tượng Danh sách nhóm người dùng và nhấn nút 'Thêm mới'.\n\nLưu ý rằng sau khi phân quyền, người dùng cần đăng xuất và đăng nhập lại để có hiệu lực phân quyền mới.
                // `,
              }
              setMessages([...messagesToSend, functionCallMessage])

              setTimeout(() => {
                messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
              }, 100);
            }

            // code block
            // code block
            break;
          case "soluongcongviec":
            var content_data = "";
            // const access_token1 = getCookie('sso_token'); // => 'value'

            // console.log("access_token", access_token)
            // const res = await fetch('https://jeehr-api.jee.vn/api/controllergeneral/GetListTypeLeaveByTitle', {
            //   method: 'GET',
            //   headers: {
            //     'Content-type': 'application/json',
            //     Authorization: `Bearer ${access_token}`,
            //     'Access-Control-Allow-Origin': '*',
            //     'Access-Control-Allow-Headers': 'Content-Type',
            //   },
            // })
            // const reponse = await res.json()
            // if (reponse) {
            //   for (let i = 0; i < reponse.data.length; i++) {
            //     // copyItems.push(items[i]);
            //     content_data = content_data + "\n" + (i + 1) + "." + reponse.data[i].title + ":" + reponse.data[i].SoNgay + " ngày" + "\n"
            //   }
            //   // reponse.data.forEach((element:any) => {
            //   //   content=element.
            //   // });
            // }
            // console.log("reponse", reponse)
            const functionCall_SLCV: ChatGPTMessage = {
              role: "assistant",
              content: "Số lượng công việc của bạn là 10 (đây là dữ liệu mẫu)"
              // content: `Để phân quyền trong quản lý cuộc họp, bạn có thể thực hiện các bước sau:\n\n1. Đăng nhập vào hệ thống quản lý và chọn chức năng Phân quyền chức năng.\n2. Tạo nhóm phân quyền mới cho quản lý cuộc họp bằng cách nhấn vào nút \"Thêm mới\" và nhập tên nhóm.\n3. Sau đó, chọn menu chức năng cụ thể liên quan đến quản lý cuộc họp, ví dụ như \"Quản lý cuộc họp\".\n4. Để phân quyền cho nhân viên thao tác trên trang quản lý cuộc họp, bạn tick chọn vào ô bên trái của dòng thông tin tương ứng.\n5. Nếu bạn muốn người dùng chỉ được xem trang mà không thể thực hiện thay đổi, hãy tick vào ô bên phải.\n6. Nhấn nút lưu để hoàn tất phân quyền.\n7. Cuối cùng, thêm nhân viên vào nhóm người dùng đã tạo bằng cách chọn vào biểu tượng Danh sách nhóm người dùng và nhấn nút 'Thêm mới'.\n\nLưu ý rằng sau khi phân quyền, người dùng cần đăng xuất và đăng nhập lại để có hiệu lực phân quyền mới.
              // `,
            }
            setMessages([...messagesToSend, functionCall_SLCV])

            setTimeout(() => {
              messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
            }, 100);
            // code block
            // code block
            break;


          default:
          // code block
        }


        // if (functionCall.name == "send_email") {

        //   // Send email
        //   try {
        //     const functionArguments = JSON.parse(functionCall.arguments)
        //     const emailResponse = await fetch("/api/email", {
        //       method: "POST",
        //       body: JSON.stringify({
        //         to: functionArguments.email,
        //         subject: functionArguments.subject,
        //         html: functionArguments.body,
        //       }),
        //     })
        //     const emailData = await emailResponse.json()
        //     console.log(emailData)
        //     const functionCallMessage: ChatGPTMessage = {
        //       role: "assistant",
        //       content: `Email has been sent to ${functionArguments.email} with subject ${functionArguments.subject}.`,
        //     }
        //     setMessages([...messagesToSend, functionCallMessage])
        //   } catch (error) {
        //     console.log(error)
        //     const functionCallMessage: ChatGPTMessage = {
        //       role: "assistant",
        //       content: `There is an error. I couldn't send the email. Please try again.`,
        //     }
        //     setMessages([...messagesToSend, functionCallMessage])
        //   } finally {
        //     return
        //   }
        // }




      }
      else {
        setMessages([...messagesToSend, data])
        setTimeout(() => {


          messageListRef.current?.scrollTo(0, messageListRef.current.scrollHeight);
        }, 100);
      }



    } catch (error) {
      console.log(error)
    } finally {
      setIsSending(false)
    }
  }
  return (
    <section className="container relative flex flex-col h-full gap-6 py-10">
      <div className="flex max-w-[980px] flex-col items-start gap-2">
        <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-4xl">
          Function Calls  with OpenAI&apos;s
        </h1>
        {isShowDialog && (
          <_RenderData data={data_donphep} onClose_data={onClose} onOk_data={onOk}
          ></_RenderData>
        )}

      </div>
      {/* Chatbox */}
      <div ref={messageListRef} style={{ height: "400px" }} className=" py-6 space-y-8 overflow-y-scroll markdown">
        {messages.map((message, index) => (
          <ChatMessage key={index + message.role} data={message} />
        ))}
        {isSending && (
          <div className="flex items-center justify-center gap-2 ml-1 max-w-fit">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <div className="text-sm text-neutral-500">Thinking...</div>
          </div>
        )}
      </div>
      {/* <ChatBox messages={messages} isSending={isSending} /> */}
      {/* Input */}
      <ChatInput handler={sendMessageHandler} />
    </section>
  )
}
