/**
 * REACT NATIVE EXAMPLE CODE
 * Đây là ví dụ code cho React Native để sử dụng flow tạo kế hoạch cai nghiện thuốc lá
 */

// ===========================================
// 1. SCREEN NHẬP THÔNG TIN HÚT THUỐC
// ===========================================

// screens/SmokingInfoScreen.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet
} from 'react-native';
import DatePicker from 'react-native-date-picker';
import { api } from '../services/api';

const SmokingInfoScreen = ({ navigation, route }) => {
  const { userId } = route.params;
  const [smokingData, setSmokingData] = useState({
    cigarettes_per_day: '',
    cost_per_pack: '',
    start_date: new Date()
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Validate input
      if (!smokingData.cigarettes_per_day || !smokingData.cost_per_pack) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }

      // API Call: Tạo smoking status
      const response = await api.post(`/smoking-status/${userId}`, {
        cigarettes_per_day: parseInt(smokingData.cigarettes_per_day),
        cost_per_pack: parseInt(smokingData.cost_per_pack),
        start_date: smokingData.start_date.toISOString()
      });

      Alert.alert(
        'Thành công!',
        'Thông tin hút thuốc đã được lưu',
        [
          {
            text: 'Tiếp tục',
            onPress: () => navigation.navigate('CreatePlanScreen', {
              smokingStatus: response.data.smokingStatus,
              userId
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể lưu thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Thông tin hút thuốc của bạn</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Số điếu thuốc/ngày *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 20"
          value={smokingData.cigarettes_per_day}
          onChangeText={(text) => setSmokingData({...smokingData, cigarettes_per_day: text})}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Giá tiền/bao (VNĐ) *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: 50000"
          value={smokingData.cost_per_pack}
          onChangeText={(text) => setSmokingData({...smokingData, cost_per_pack: text})}
          keyboardType="numeric"
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày bắt đầu hút thuốc</Text>
        <DatePicker
          date={smokingData.start_date}
          mode="date"
          onDateChange={(date) => setSmokingData({...smokingData, start_date: date})}
        />
      </View>
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang lưu...' : 'Tiếp tục'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ===========================================
// 2. SCREEN TẠO KẾ HOẠCH
// ===========================================

// screens/CreatePlanScreen.js
const CreatePlanScreen = ({ navigation, route }) => {
  const { smokingStatus, userId } = route.params;
  const [planData, setPlanData] = useState({
    name: '',
    reason: '',
    start_date: new Date(),
    target_quit_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 ngày
    coach_id: null
  });
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoaches();
  }, []);

  const fetchCoaches = async () => {
    try {
      const response = await api.get('/coaches'); // API lấy danh sách coach
      setCoaches(response.data);
    } catch (error) {
      console.error('Error fetching coaches:', error);
    }
  };

  const calculateMonthlyCost = () => {
    const packsPerDay = smokingStatus.cigarettes_per_day / 20;
    const dailyCost = packsPerDay * smokingStatus.cost_per_pack;
    return dailyCost * 30;
  };

  const handleCreatePlan = async () => {
    try {
      setLoading(true);

      if (!planData.name || !planData.reason) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }

      // ✅ API Call: User tự tạo quit plan (không cần coach duyệt)
      const response = await quitPlanAPI.createUserPlan({
        ...planData,
        start_date: planData.start_date.toISOString(),
        target_quit_date: planData.target_quit_date.toISOString()
      });

      Alert.alert(
        'Thành công!',
        'Kế hoạch cai thuốc đã được tạo thành công!',
        [
          {
            text: 'Xem kế hoạch',
            onPress: () => navigation.navigate('DashboardScreen', { userId })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể tạo kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Tạo kế hoạch cai thuốc</Text>
      
      {/* Hiển thị thông tin smoking status */}
      <View style={styles.statusCard}>
        <Text style={styles.statusTitle}>📊 Thông tin hút thuốc hiện tại</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Số điếu/ngày:</Text>
          <Text style={styles.statusValue}>{smokingStatus.cigarettes_per_day}</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Chi phí/bao:</Text>
          <Text style={styles.statusValue}>{smokingStatus.cost_per_pack.toLocaleString()} VNĐ</Text>
        </View>
        <View style={styles.statusRow}>
          <Text style={styles.statusLabel}>Chi phí/tháng:</Text>
          <Text style={[styles.statusValue, styles.highlightText]}>
            {calculateMonthlyCost().toLocaleString()} VNĐ
          </Text>
        </View>
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên kế hoạch *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ví dụ: Kế hoạch cai thuốc của tôi"
          value={planData.name}
          onChangeText={(text) => setPlanData({...planData, name: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Lý do muốn bỏ thuốc *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Ví dụ: Vì sức khỏe gia đình, tiết kiệm tiền..."
          value={planData.reason}
          onChangeText={(text) => setPlanData({...planData, reason: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      <CoachSelector 
        coaches={coaches}
        selectedCoach={planData.coach_id}
        onSelect={(coachId) => setPlanData({...planData, coach_id: coachId})}
      />
      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCreatePlan}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang tạo...' : 'Tạo kế hoạch'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ===========================================
// 2.5. SCREEN EDIT QUIT PLAN
// ===========================================

// screens/EditPlanScreen.js
const EditPlanScreen = ({ navigation, route }) => {
  const { planData } = route.params;
  const [editData, setEditData] = useState({
    name: planData.name || '',
    reason: planData.reason || '',
    start_date: new Date(planData.start_date),
    target_quit_date: new Date(planData.target_quit_date),
    image: planData.image || ''
  });
  const [loading, setLoading] = useState(false);

  const handleUpdatePlan = async () => {
    try {
      setLoading(true);

      if (!editData.name || !editData.reason) {
        Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
        return;
      }

      // ✅ API Call: User cập nhật quit plan của mình
      const response = await quitPlanAPI.updateUserPlan(planData._id, {
        ...editData,
        start_date: editData.start_date.toISOString(),
        target_quit_date: editData.target_quit_date.toISOString()
      });

      Alert.alert(
        'Thành công!',
        'Kế hoạch đã được cập nhật thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật kế hoạch');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa kế hoạch này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await quitPlanAPI.deleteUserPlan(planData._id);
              Alert.alert('Thành công', 'Kế hoạch đã được xóa');
              navigation.navigate('HomeScreen');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa kế hoạch');
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Chỉnh sửa kế hoạch</Text>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Tên kế hoạch *</Text>
        <TextInput
          style={styles.input}
          placeholder="Tên kế hoạch"
          value={editData.name}
          onChangeText={(text) => setEditData({...editData, name: text})}
        />
      </View>
      
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Lý do cai thuốc *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Lý do muốn bỏ thuốc"
          value={editData.reason}
          onChangeText={(text) => setEditData({...editData, reason: text})}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày bắt đầu</Text>
        <DatePicker
          date={editData.start_date}
          mode="date"
          onDateChange={(date) => setEditData({...editData, start_date: date})}
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Ngày mục tiêu</Text>
        <DatePicker
          date={editData.target_quit_date}
          mode="date"
          onDateChange={(date) => setEditData({...editData, target_quit_date: date})}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleUpdatePlan}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Đang cập nhật...' : 'Cập nhật kế hoạch'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.deleteButton]}
        onPress={handleDeletePlan}
      >
        <Text style={[styles.buttonText, styles.deleteButtonText]}>
          Xóa kế hoạch
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// ===========================================
// 3. SCREEN DASHBOARD
// ===========================================

// screens/DashboardScreen.js
const DashboardScreen = ({ route }) => {
  const { userId } = route.params;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // API Call: Lấy thông tin dashboard
      const response = await api.get(`/quit-plan/dashboard/${userId}`);
      setDashboardData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        Alert.alert('Thông báo', 'Bạn chưa có kế hoạch cai thuốc nào');
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin dashboard');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!dashboardData) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Không có dữ liệu</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header với thông tin kế hoạch */}
      <View style={styles.planCard}>
        <Text style={styles.planName}>{dashboardData.quit_plan.name}</Text>
        <Text style={styles.planReason}>{dashboardData.quit_plan.reason}</Text>
        <Text style={styles.planDates}>
          {formatDate(dashboardData.quit_plan.start_date)} - {formatDate(dashboardData.quit_plan.target_quit_date)}
        </Text>
      </View>

      {/* Thông tin smoking status */}
      {dashboardData.smoking_status && (
        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>🚬 Thông tin hút thuốc</Text>
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>
                {dashboardData.smoking_status.cigarettes_per_day}
              </Text>
              <Text style={styles.statusLabel}>điếu/ngày</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>
                {dashboardData.progress_stats.money_saved.toLocaleString()}
              </Text>
              <Text style={styles.statusLabel}>VNĐ tiết kiệm</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusNumber}>
                {dashboardData.progress_stats.cigarettes_avoided}
              </Text>
              <Text style={styles.statusLabel}>điếu tránh được</Text>
            </View>
          </View>
        </View>
      )}

      {/* Progress Card */}
      <ProgressCard 
        currentStage={dashboardData.current_stage}
        progressStats={dashboardData.progress_stats}
      />

      {/* Health Improvements */}
      <HealthImprovements 
        improvements={dashboardData.progress_stats.health_improvements}
      />

      {/* Upcoming Tasks */}
      <TasksList 
        tasks={dashboardData.upcoming_tasks}
        onTaskComplete={(taskId) => handleCompleteTask(taskId)}
      />
    </ScrollView>
  );
};

// ===========================================
// 4. COMPONENTS
// ===========================================

// components/ProgressCard.js
const ProgressCard = ({ currentStage, progressStats }) => {
  return (
    <View style={styles.progressCard}>
      <Text style={styles.cardTitle}>📈 Tiến độ hiện tại</Text>
      
      {currentStage && (
        <Text style={styles.stageName}>{currentStage.title}</Text>
      )}
      
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${progressStats.completion_percentage}%` }
          ]} 
        />
      </View>
      
      <Text style={styles.progressText}>
        {progressStats.completion_percentage}% hoàn thành
      </Text>
      
      <View style={styles.statsRow}>
        <Text style={styles.daysCount}>
          Ngày {progressStats.days_since_start} / {progressStats.total_days}
        </Text>
        <Text style={styles.stagesCount}>
          Giai đoạn {progressStats.completed_stages} / {progressStats.total_stages}
        </Text>
      </View>
    </View>
  );
};

// components/TasksList.js
const TasksList = ({ tasks, onTaskComplete }) => {
  return (
    <View style={styles.tasksCard}>
      <Text style={styles.cardTitle}>✅ Nhiệm vụ sắp tới</Text>
      
      {tasks.map((task, index) => (
        <View key={task._id} style={styles.taskItem}>
          <View style={styles.taskContent}>
            <Text style={styles.taskTitle}>{task.title}</Text>
            <Text style={styles.taskDescription}>{task.description}</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.completeButton}
            onPress={() => onTaskComplete(task._id)}
          >
            <Text style={styles.completeButtonText}>Hoàn thành</Text>
          </TouchableOpacity>
        </View>
      ))}
      
      {tasks.length === 0 && (
        <Text style={styles.emptyText}>Không có nhiệm vụ nào</Text>
      )}
    </View>
  );
};

// ===========================================
// 5. API SERVICE
// ===========================================

// services/api.js
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://your-backend-url/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Interceptor để thêm token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API functions
export const smokingStatusAPI = {
  create: (userId, data) => api.post(`/smoking-status/${userId}`, data),
  get: (userId) => api.get(`/smoking-status/${userId}`),
  update: (userId, data) => api.put(`/smoking-status/${userId}`, data),
};

export const quitPlanAPI = {
  // ✅ User self-management APIs
  createUserPlan: (data) => api.post('/quit-plan/create', data),
  updateUserPlan: (planId, data) => api.put(`/quit-plan/${planId}`, data),
  deleteUserPlan: (planId) => api.delete(`/quit-plan/${planId}`),
  sendRequest: (data) => api.post('/quit-plan/request', data),
  getDashboard: (userId) => api.get(`/quit-plan/dashboard/${userId}`),
  getProgress: (userId) => api.get(`/quit-plan/progress/${userId}`),
  updateStageProgress: (stageId, data) => api.put(`/quit-plan/stage/${stageId}/progress`, data),
  completeTask: (taskId) => api.post(`/quit-plan/task/${taskId}/complete`),
  // Coach/Admin APIs (deprecated for user workflow)
  createWithStatus: (data) => api.post('/quit-plan/create-with-status', data),
  createForUser: (data) => api.post('/quit-plan/', data),
};

export { api };

// ===========================================
// 6. STYLES
// ===========================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  highlightText: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  taskItem: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 8,
  },
  taskContent: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: 'center',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});

// ===========================================
// 7. UTILITY FUNCTIONS
// ===========================================

// utils/helpers.js
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

export const calculateSavings = (smokingStatus, daysSinceStart) => {
  const packsPerDay = smokingStatus.cigarettes_per_day / 20;
  const dailyCost = packsPerDay * smokingStatus.cost_per_pack;
  return dailyCost * daysSinceStart;
};
  // ✅ Additional styles for Edit/Delete Plan functionality
  deleteButton: {
    backgroundColor: '#f44336',
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#fff',
  },
  editButton: {
    backgroundColor: '#2196F3',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planInfo: {
    flex: 1,
    marginRight: 12,
  },