# LAB 2: APPLICATION PROGRAMMING INTERFACE AND FIREBASE STUDIO

Dự án này là một ứng dụng **PDF Chatbot Assistant**, sử dụng **FastAPI** cho backend, **React** cho frontend và **Firebase** cho toàn bộ hệ thống xác thực (Authentication) cùng cơ sở dữ liệu (Firestore).

## 1. Thông tin sinh viên

| Thông tin | Nội dung |
|-----------|----------|
| Họ và tên | Dương Ngọc Minh Thư |
| MSSV | 24120144 |
| Lớp | 24CTT5 |
| Môn học | Tư duy tính toán |
| Giảng viên thực hành | Lê Đức Khoan |

## 2. Mục tiêu thực hành

- Xây dựng dự án ứng dụng chatbot hỗ trợ hỏi đáp tài liệu PDF, sử dụng FastAPI cho Backend, React cho Frontend và Firebase làm hệ thống xác thực và cơ sở dữ liệu.
- Nắm vững kiến thức về FastAPI để thiết kế và xây dựng các API Endpoint phục vụ giao tiếp giữa Frontend và Backend.
- Vận dụng kiến thức đã học về API, Firebase để xây dựng ứng dụng.
- Hiểu rõ hơn về cách tích hợp các công nghệ khác nhau để tạo thành một ứng dụng hoàn chỉnh.


## 3. Công nghệ sử dụng
| Hệ     thống | Công nghệ sử dụng |
| :--- | :--- |
| **Frontend** | React, Tailwind CSS, Lucide React, Axios |
| **Backend** | FastAPI, Python, PyMuPDF (xử lý PDF), LangChain (chunking), Sentence-Transformers (Embeddings) |
| **Database & Auth** | Google Firebase (Authentication & Firestore) |
| **AI Model** | `xlm-roberta-base-squad2` (Extractive QA) hoặc generative model tích hợp qua API |

## 4. Mô tả chức năng
- **Xác thực người dùng:** Đăng nhập/Đăng ký bằng Email/Password hoặc Google qua Firebase Auth.
- **Quản lý Workspace (Projects):** Tạo, cập nhật và xóa các Project để phân loại tài liệu.
- **Quản lý Nguồn dữ liệu:**
    - Upload file PDF (giới hạn 5MB).
    - Thêm nội dung văn bản trực tiếp.
    - Xóa các nguồn dữ liệu đã tải lên.
- **Hệ thống Chat thông minh:**
    - Truy vấn thông tin dựa trên ngữ cảnh từ các tài liệu đã upload trong Project.
    - Sử dụng vector search đơn giản và mô hình QA để trích xuất câu trả lời.
- **Lịch sử hội thoại:** Tự động lưu trữ và quản lý nhiều phiên chat trong mỗi Project.

## 5. Danh sách API Endpoints

### System
| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/` | Trả về thông tin hệ thống |
| `GET` | `/health` | Kiểm tra trạng thái server và tài liệu trong memory. |

### Authentication
| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/auth/me` | Xác thực người dùng qua Firebase Token và trả về thông tin user profile. |

### Project Management
| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/projects` | Liệt kê tất cả các project hiện có. |
| `POST` | `/projects` | Tạo một project mới (yêu cầu name, description). |
| `GET` | `/projects/{id}` | Lấy thông tin chi tiết của một project cụ thể. |
| `PUT` | `/projects/{id}` | Cập nhật tên hoặc mô tả của project. |
| `DELETE` | `/projects/{id}` | Xóa project cùng toàn bộ dữ liệu liên quan. |

### Source Management
| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/projects/{id}/sources` | Liệt kê các nguồn tài liệu (PDF, Text) trong project. |
| `POST` | `/projects/{id}/upload-pdf` | Tải lên file PDF, trích xuất văn bản và băm nhỏ (chunking). |
| `POST` | `/projects/{id}/add-text` | Thêm dữ liệu văn bản trực tiếp vào project. |
| `DELETE` | `/projects/{id}/sources/{source_id}` | Xóa một nguồn tài liệu cụ thể. |

### Conversations & AI Chat
| Phương thức | Endpoint | Mô tả |
| --- | --- | --- |
| `GET` | `/projects/{id}/conversations` | Lấy danh sách các cuộc hội thoại trong project. |
| `POST` | `/projects/{id}/conversations` | Tạo một cuộc hội thoại mới. |
| `GET` | `/projects/{id}/conversations/{conv_id}` | Lấy chi tiết nội dung tin nhắn của một cuộc hội thoại. |
| `PUT` | `/projects/{id}/conversations/{conv_id}` | Đổi tên tiêu đề cuộc hội thoại. |
| `DELETE` | `/projects/{id}/conversations/{conv_id}` | Xóa cuộc hội thoại. |
| `POST` | `/projects/{id}/chat` | Gửi câu hỏi cho AI dựa trên ngữ cảnh tài liệu và nhận câu trả lời. |
| `DELETE` | `/projects/{id}/conversations/{conv_id}/messages/{msg_id}` | Xóa một tin nhắn cụ thể trong cuộc hội thoại. |

## 6. Cấu trúc dự án
```text
LAB-2-API-AND-FIREBASE-STUDIO/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py               # Cấu hình môi trường & hằng số
│   │   │   └── firebase_config.py      # Khởi tạo Firebase Admin SDK
│   │   ├── dependencies/
│   │   │   ├── auth.py                 # Dependency kiểm tra Token
│   │   │   └── singleton.py            # Quản lý state toàn cục (QA Model)
│   │   ├── routers/
│   │   │   ├── auth.py                 # Endpoint /auth/me
│   │   │   ├── health.py               # Endpoint /health
│   │   │   └── project_router.py       # Endpoints chính (CRUD, Chat, Upload)
│   │   ├── schemas/
│   │   │   ├── chat_schema.py          # Schema cho tin nhắn & hội thoại
│   │   │   ├── pdf_schema.py           # Schema cho tài liệu PDF
│   │   │   ├── qa_schema.py            # Schema cho câu hỏi/trả lời AI
│   │   │   ├── user_schema.py          # Schema cho thông tin người dùng
│   │   │   └── __init__.py
│   │   ├── services/
│   │   │   ├── ai/
│   │   │   │   ├── pdf/
│   │   │   │   │   ├── chunking.py     # Logic chia nhỏ văn bản
│   │   │   │   │   └── loader.py       # Logic trích xuất PDF
│   │   │   │   └── qa/
│   │   │   │       ├── chat_service.py # Logic xử lý hội thoại AI
│   │   │   │       ├── model.py        # Khởi tạo mô hình ngôn ngữ
│   │   │   │       ├── retriever.py    # Logic tìm kiếm ngữ cảnh (RAG)
│   │   │   │       └── __init__.py
│   │   │   └── storage/
│   │   │       └── storage_service.py  # Thao tác trực tiếp với Firestore
│   │   ├── utils/
│   │   │   ├── load_model.py           # Tiện ích tải mô hình AI
│   │   │   └── __init__.py
│   │   └── main.py                     # Entry point khởi tạo FastAPI
│   └── uploads/                        # Thư mục tạm chứa file PDF
├── frontend/
│   ├── public/
│   │   └── favicon.png                 # Icon trình duyệt
│   ├── src/
│   │   ├── assets/
│   │   │   ├── login.png               # Logo trang Đăng nhập
│   │   │   ├── sidebar.png             # Logo thanh bên Sidebar
│   │   │   ├── empty.png               # Hình ảnh trạng thái trống
│   │   │   └── meow.png                # Icon mèo cho các Modal/Chat
│   │   ├── components/
│   │   │   ├── chat/
│   │   │   │   ├── ChatBox.jsx         # Khung hiển thị tin nhắn
│   │   │   │   ├── InputBox.jsx        # Ô nhập liệu tin nhắn
│   │   │   │   └── Message.jsx         # Component hiển thị từng tin nhắn
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx          # Thanh điều hướng trên
│   │   │   │   ├── ProjectDashboard.jsx # Bảng điều khiển dự án
│   │   │   │   └── Sidebar.jsx         # Thanh bên quản lý Workspace
│   │   │   └── ui/
│   │   │       ├── CatConfirmModal.jsx # Modal xác nhận kiểu mèo
│   │   │       ├── CuteButton.jsx      # Button custom phong cách cute
│   │   │       ├── EmptyState.jsx      # Hiển thị khi chưa có dữ liệu
│   │   │       └── UploadButton.jsx    # Nút tải lên tài liệu
│   │   ├── hooks/
│   │   │   └── useChatLogic.js         # Hook xử lý logic Chat & API
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx            # Trang Chat chính
│   │   │   └── LoginPage.jsx           # Trang Đăng nhập
│   │   ├── services/
│   │   │   └── api.js                  # Cấu hình Axios Client
│   │   ├── utils/
│   │   │   └── formatDate.js           # Helper định dạng thời gian
│   │   ├── App.jsx                     # Quản lý Routing
│   │   ├── firebase.js                 # Cấu hình Firebase Web SDK
│   │   ├── index.css                   # Global Styles (Vanilla CSS)
│   │   └── main.jsx                    # Entry point React
│   ├── eslint.config.js                # Cấu hình Linter cho JS
│   ├── index.html                      # Template HTML chính
│   ├── package.json                    # Quản lý thư viện JS
│   ├── postcss.config.js               # Cấu hình PostCSS
│   ├── tailwind.config.js              # Cấu hình TailwindCSS
│   └── vite.config.js                  # Cấu hình Vite
├── .env                                # Biến môi trường (Secret)
├── .env.example                        # Template biến môi trường
├── .gitignore                          # File bỏ qua Git
├── requirements.txt                    # Thư viện Python (FastAPI, Firebase, Transformers, ...)
└── README.md                           # Tài liệu hướng dẫn
```

## 7. Yêu cầu hệ thống
Trước khi cài đặt, đảm bảo máy tính của bạn đã cài đặt sẵn:

|Phần mềm|Phiên bản và yêu cầu|
|---|---|
| **Python**| Phiên bản 3.9 trở lên (dùng cho FastAPI và AI model). |
| **Node.js**| Phiên bản 18.x trở lên (dùng cho môi trường React/Vite). |
| **Git**| Để clone source code. |

## 8. Hướng dẫn cài đặt Environment

### 8.1. Clone Repository
```bash
# Clone repository
git clone https://github.com/dnmthuw/LAB-2-API-AND-FIREBASE-STUDIO.git

# Vào thư mục dự án
cd LAB-2-API-AND-FIREBASE-STUDIO
```

### 8.2. Thiết lập Firebase
1.  Truy cập [Firebase Console](https://console.firebase.google.com/).
2.  Tạo Project mới.
3.  **Authentication:** Bật phương thức `Email/Password` và `Google`.
4.  **Firestore Database:** Tạo database ở chế độ test hoặc production (nhớ update rules).
5.  **Service Account:** 
    *   Vào Project Settings > Service Accounts.
    *   Tạo phím mới (JSON) và lưu vào thư mục gốc của project (đặt tên ví dụ: `firebase-key.json`).
6.  **Web App Config:** 
    *   Tạo Web App trong Firebase.
    *   Copy các thông số cấu hình (`apiKey`, `authDomain`, ...) để điền vào file `.env` của frontend.

### 8.3. Cấu hình file `.env`
Tạo file `.env` tại thư mục gốc:

```env
# BACKEND 
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL="your-client-email@your-project-id.iam.gserviceaccount.com"

# FRONTEND 
VITE_API_BASE_URL=http://localhost:8000
VITE_FIREBASE_API_KEY="your-api-key"
VITE_FIREBASE_AUTH_DOMAIN="your-project-id.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="your-project-id"
VITE_FIREBASE_STORAGE_BUCKET="your-project-id.firebasestorage.app"
VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
VITE_FIREBASE_APP_ID="your-app-id"
```

hoặc copy từ file `.env.example`
```bash
cp .env.example .env
```

## 9. Hướng dẫn chạy dự án

### Backend
1.  Di chuyển vào thư mục backend: `cd backend`
2.  Tạo môi trường ảo: `python -m venv venv`
3.  Kích hoạt venv: `venv\Scripts\activate` (Windows) hoặc `source venv/bin/activate` (Mac/Linux)
4.  Cài đặt thư viện: `pip install -r ../requirements.txt`
5.  Chạy server: `python -m uvicorn app.main:app --reload`

### Frontend
1.  Di chuyển vào thư mục frontend: `cd frontend`
2.  Cài đặt dependencies: `npm install`
3.  Chạy ứng dụng: `npm run dev`

## 10. Cấu trúc Database Firestore
Hệ thống sử dụng mô hình dữ liệu NoSQL phân cấp (Hierarchical Document-Oriented) để tối ưu hóa truy vấn:

```text
Firestore 
├── projects 
│   └── {project_id} 
│       ├── user_id: string (Firebase Auth UID)
│       ├── name: string
│       ├── description: string
│       ├── created_at: string 
│       ├── sources 
│       │   └── [ { id, name, type, size_bytes, content, document_id, uploaded_at } ]
│       ├── conversations 
│       │   └── { "{conv_id}": { id, title, created_at, updated_at } }
│       │
│       └── conversations 
│           └── {conv_id} 
│               ├── active: boolean
│               └── messages 
│                   └── {message_id} 
│                       ├── role: string 
│                       ├── content: string
│                       └── timestamp: string 
│
└── chunks 
    └── {document_id} (Document)
        ├── chunks (Array of Strings)
        └── updated_at: string (ISO 8601)
```

**Ghi chú thiết kế:**
- **Metadata vs Data**: Các thông tin tóm tắt (tiêu đề hội thoại, danh sách file) được lưu ngay trên `project document` (dạng Array/Map) để frontend load cực nhanh khi mở ứng dụng.
- **Tách biệt Chunks**: Dữ liệu Text Chunks (rất nặng) được đưa ra một Collection độc lập (`chunks`) kết nối qua `document_id`. Điều này giúp Project Document không vượt quá giới hạn 1MB của Firestore và tiết kiệm băng thông khi không cần trích xuất AI.

## 11. Screenshot

### Trang Login
![image](./images/login.png)

### Trang Workspace
![image](./images/workspace.png)

### Trang Project
![image](./images/project.png)

### Trang Chat
![image](./images/chat.png)

## 12. Video Demo

Xem *[Video Demo Lab 2](https://youtu.be/hYsbDsLJdRM)* để có cái nhìn tổng quan về dự án!
