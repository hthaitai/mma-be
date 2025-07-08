const mongoose = require('mongoose');
const dotenv = require('dotenv');
const KnowledgeBase = require('../models/KnowledgeBase.model');

dotenv.config({ path: '../../.env' });

const knowledgeBaseData = [
  {
    "intent": "chao_hoi",
    "topic": "Chung",
    "responses": [
      "Chào bạn, tôi có thể giúp gì cho bạn hôm nay trên hành trình bỏ thuốc lá?",
      "Xin chào! Thật tuyệt khi thấy bạn ở đây. Cùng nhau cố gắng nhé!",
      "Chào bạn, bạn cảm thấy thế nào hôm nay? Hãy nhớ rằng mỗi ngày không hút thuốc là một chiến thắng."
    ]
  },
  {
    "intent": "tam_biet",
    "topic": "Chung",
    "responses": [
      "Tạm biệt! Hãy quay lại bất cứ khi nào bạn cần nhé. Cố lên!",
      "Chúc bạn một ngày tốt lành và mạnh mẽ! Hẹn gặp lại sau.",
      "Tạm biệt nhé. Hãy nhớ lý do bạn bắt đầu."
    ]
  },
  {
    "intent": "ho_tro_khi_them",
    "topic": "Mẹo",
    "responses": [
      "Cơn thèm thuốc thường chỉ kéo dài 5-10 phút. Hãy thử uống một ly nước lọc, nó thực sự giúp ích đấy!",
      "Hãy hít thở sâu nào. Hít vào chậm trong 5 giây, giữ lại 5 giây rồi thở ra từ từ. Lặp lại vài lần nhé.",
      "Hãy thử đánh lạc hướng bản thân! Gọi điện cho một người bạn, đi dạo một chút, hoặc xem một video hài hước xem sao.",
      "Nhai kẹo cao su không đường hoặc ăn một ít hạt hướng dương có thể giúp bạn vượt qua cơn thèm này.",
      "Hãy nhớ lại lý do bạn muốn bỏ thuốc. Sức khỏe của bạn và những người thân yêu xứng đáng với nỗ lực này."
    ]
  },
  {
    "intent": "hoi_loi_ich_suc_khoe",
    "topic": "Sức khỏe",
    "responses": [
      "Chỉ 20 phút sau khi bỏ thuốc, nhịp tim và huyết áp của bạn bắt đầu giảm xuống.",
      "Trong vòng 12 giờ, mức carbon monoxide trong máu của bạn trở lại bình thường.",
      "Sau 2 tuần đến 3 tháng, tuần hoàn máu của bạn cải thiện và chức năng phổi tăng lên đáng kể.",
      "Sau 1 năm, nguy cơ mắc bệnh tim mạch vành của bạn giảm đi một nửa so với người hút thuốc.",
      "Sau 5 năm, nguy cơ đột quỵ của bạn giảm xuống tương đương với người không hút thuốc."
    ]
  },
  {
    "intent": "hoi_chi_phi_tiet_kiem",
    "topic": "Tài chính",
    "responses": [
      "Bạn có biết rằng nếu mỗi ngày bạn hút 1 gói thuốc giá 30.000đ, bạn sẽ tiết kiệm được hơn 10 triệu đồng mỗi năm không? Hãy nghĩ xem bạn có thể làm gì với số tiền đó!",
      "Hãy thử tính xem bạn đã tiết kiệm được bao nhiêu tiền kể từ khi bỏ thuốc. Đó là một con số ấn tượng và là một nguồn động lực tuyệt vời đấy!",
      "Số tiền bạn tiết kiệm được từ việc không mua thuốc lá có thể dùng cho một chuyến du lịch, một món đồ công nghệ mới, hoặc đầu tư cho tương lai của bạn."
    ]
  },
  {
    "intent": "cam_thay_cau_kinh",
    "topic": "Triệu chứng cai thuốc",
    "responses": [
      "Cảm thấy cáu kỉnh là một triệu chứng cai thuốc rất phổ biến. Điều này là hoàn toàn bình thường và sẽ giảm dần theo thời gian.",
      "Hãy thử các hoạt động thể chất nhẹ nhàng như đi bộ, yoga hoặc thiền để giúp giải tỏa căng thẳng.",
      "Hãy nói cho gia đình và bạn bè biết rằng bạn có thể hơi nhạy cảm trong giai đoạn này và mong họ thông cảm. Sự hỗ trợ từ người thân là rất quan trọng.",
      "Đảm bảo bạn ngủ đủ giấc và ăn uống lành mạnh. Một cơ thể khỏe mạnh sẽ giúp tinh thần ổn định hơn."
    ]
  },
  {
    "intent": "can_them_dong_luc",
    "topic": "Động lực",
    "responses": [
      "Bạn mạnh mẽ hơn bạn nghĩ rất nhiều. Mỗi giây phút bạn không cầm điếu thuốc là một bằng chứng.",
      "Hành trình vạn dặm bắt đầu bằng một bước chân. Bạn đã bắt đầu rồi, hãy tiếp tục tiến lên.",
      "Hãy tự hào về bản thân vì đã đưa ra quyết định đúng đắn này. Bạn đang làm một điều tuyệt vời cho sức khỏe của mình.",
      "Đừng nản lòng nếu có vấp ngã. Điều quan trọng là bạn đứng dậy và tiếp tục cố gắng."
    ]
  },
  {
    "intent": "khong_ngu_duoc",
    "topic": "Triệu chứng cai thuốc",
    "responses": [
        "Mất ngủ là một triệu chứng cai thuốc thường gặp. Hãy thử tạo một thói quen thư giãn trước khi ngủ: đọc sách, nghe nhạc nhẹ hoặc tắm nước ấm.",
        "Tránh sử dụng các thiết bị điện tử có màn hình xanh ít nhất 1 giờ trước khi ngủ.",
        "Hạn chế caffeine và đồ uống có cồn, đặc biệt là vào buổi chiều và buổi tối.",
        "Nếu tình trạng kéo dài, đừng ngần ngại tham khảo ý kiến của bác sĩ nhé."
    ]
  }
];

const seedDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await KnowledgeBase.deleteMany({});
  await KnowledgeBase.insertMany(knowledgeBaseData);
  console.log('KnowledgeBase seeded!');
  mongoose.connection.close();
};

seedDB();
