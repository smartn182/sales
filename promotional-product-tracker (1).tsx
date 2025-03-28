import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, Truck, Package, Printer, Warehouse, X, Info, 
  ShoppingBag, MapPin, RefreshCw, PlusCircle, Upload, Save, User, LogIn
} from 'lucide-react';

const ProductStatusTracker = () => {
  // 인쇄 유형 정의
  const PrintTypes = {
    LASER: '레이저 인쇄',
    TRANSFER: '전사 인쇄',
    NO_PRINT: '인쇄 없음',
    SCREEN: '스크린 인쇄',
    DIGITAL: '디지털 인쇄'
  };

  // 배송 방법 정의
  const DeliveryMethods = {
    DIRECT_PICKUP: '직접 인수',
    COURIER: '택배',
    QUICK_SERVICE: '퀵 서비스'
  };

  // 담당자 목록
  const staff = [
    { id: 1, name: "신흥철", department: "이사" },
    { id: 2, name: "장정금", department: "실장" },
    { id: 3, name: "신종우", department: "대표" },
    { id: 4, name: "조재호", department: "디자인팀장" },
    { id: 5, name: "이현주", department: "OP매니저" },
    { id: 6, name: "효선", department: "OP팀" },
    { id: 7, name: "앰버", department: "OP팀" }
  ];

  // 로그인 상태 관리
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginVisible, setLoginVisible] = useState(false);
  const [loginCredentials, setLoginCredentials] = useState({
    username: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [currentUser, setCurrentUser] = useState(staff[2]); // 기본값은 신종우 대표님

  // 초기 데이터
  const initialProducts = [
    {
      id: 'P001',
      name: '기업 노트북 가방',
      client: 'ABC 기업',
      quantity: 500,
      printType: PrintTypes.LASER,
      deliveryMethod: DeliveryMethods.COURIER,
      manager: staff[2],
      stages: [
        { name: '입고', completed: true, date: '2024-03-25', updatedBy: staff[0] },
        { name: '인쇄 컨펌', completed: true, date: '2024-03-26', updatedBy: staff[3] },
        { name: '인쇄 중', completed: true, date: '2024-03-27', updatedBy: staff[3] },
        { name: '포장', completed: true, date: '2024-03-28', updatedBy: staff[5] },
        { name: '발송', completed: true, date: '2024-03-29', updatedBy: staff[6] }
      ]
    },
    {
      id: 'P002',
      name: '판촉용 우산',
      client: '삼성전자',
      quantity: 200,
      printType: PrintTypes.TRANSFER,
      deliveryMethod: DeliveryMethods.DIRECT_PICKUP,
      manager: staff[1],
      stages: [
        { name: '입고', completed: true, date: '2024-03-24', updatedBy: staff[4] },
        { name: '인쇄 컨펌', completed: true, date: '2024-03-26', updatedBy: staff[3] },
        { name: '인쇄 중', completed: false, date: null, updatedBy: null },
        { name: '포장', completed: false, date: null, updatedBy: null },
        { name: '발송', completed: false, date: null, updatedBy: null }
      ]
    },
    {
      id: 'P003',
      name: '홍보용 텀블러',
      client: 'LG전자',
      quantity: 350,
      printType: PrintTypes.LASER,
      deliveryMethod: DeliveryMethods.COURIER,
      manager: staff[4],
      stages: [
        { name: '입고', completed: true, date: '2024-03-26', updatedBy: staff[4] },
        { name: '인쇄 컨펌', completed: true, date: '2024-03-27', updatedBy: staff[3] },
        { name: '인쇄 중', completed: true, date: '2024-03-28', updatedBy: staff[3] },
        { name: '포장', completed: false, date: null, updatedBy: null },
        { name: '발송', completed: false, date: null, updatedBy: null }
      ]
    }
  ];

  // 상태 변수들
  const [products, setProducts] = useState(initialProducts);
  const [completedShipments, setCompletedShipments] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [fileError, setFileError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    client: '',
    quantity: 1,
    printType: PrintTypes.LASER,
    deliveryMethod: DeliveryMethods.COURIER,
    manager: currentUser
  });
  
  // 초기화
  useEffect(() => {
    // 발송 완료된 상품 찾기
    const completed = initialProducts
      .filter(product => {
        const lastStage = product.stages[product.stages.length - 1];
        return lastStage.completed;
      })
      .slice(0, 5);
    
    setCompletedShipments(completed);
  }, []);
  
  // 로그인 체크
  useEffect(() => {
    // 자동 로그인 (개발/테스트용)
    // 실제 구현 시 토큰 검증이나 세션 확인 코드가 들어갈 위치
    setIsLoggedIn(true);
  }, []);

  // 상태 업데이트 함수
  const handleStatusUpdate = (productId, stageIndex) => {
    setProducts(prevProducts => 
      prevProducts.map(product => {
        if (product.id === productId) {
          const updatedStages = [...product.stages];
          const newStatus = !updatedStages[stageIndex].completed;
          
          updatedStages[stageIndex] = {
            ...updatedStages[stageIndex],
            completed: newStatus,
            date: newStatus ? new Date().toISOString().split('T')[0] : null,
            updatedBy: currentUser
          };
          
          // 발송 단계 처리
          if (stageIndex === updatedStages.length - 1) {
            if (newStatus) {
              // 발송 완료되면 목록에 추가
              const updatedProduct = { ...product, stages: updatedStages };
              setCompletedShipments(prev => {
                const exists = prev.some(p => p.id === product.id);
                if (exists) return prev;
                return [updatedProduct, ...prev].slice(0, 5);
              });
            } else {
              // 발송 취소되면 목록에서 제거
              setCompletedShipments(prev => 
                prev.filter(p => p.id !== product.id)
              );
            }
          }
          
          return { ...product, stages: updatedStages };
        }
        return product;
      })
    );
  };

  // 새 상품 ID 생성
  const generateProductId = () => {
    const lastId = products.length > 0 
      ? parseInt(products[products.length - 1].id.replace('P', ''), 10) 
      : 0;
    return `P${String(lastId + 1).padStart(3, '0')}`;
  };

  // 새 상품 입력 필드 변경
  const handleNewProductChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({ ...prev, [name]: value }));
  };

  // 담당자 선택 변경
  const handleManagerChange = (e) => {
    const selectedStaffId = parseInt(e.target.value);
    const selectedStaffMember = staff.find(s => s.id === selectedStaffId);
    setNewProduct(prev => ({ ...prev, manager: selectedStaffMember }));
  };

  // 새 상품 추가
  const handleAddProduct = () => {
    // 필수 필드 검증
    if (!newProduct.name || !newProduct.client) {
      alert('상품명과 클라이언트는 필수 입력 항목입니다.');
      return;
    }
    
    const productId = generateProductId();
    const today = new Date().toISOString().split('T')[0];
    
    const product = {
      ...newProduct,
      id: productId,
      stages: [
        { name: '입고', completed: true, date: today, updatedBy: newProduct.manager },
        { name: '인쇄 컨펌', completed: false, date: null, updatedBy: null },
        { name: '인쇄 중', completed: false, date: null, updatedBy: null },
        { name: '포장', completed: false, date: null, updatedBy: null },
        { name: '발송', completed: false, date: null, updatedBy: null }
      ]
    };

    setProducts(prev => [...prev, product]);
    
    // 폼 초기화
    setNewProduct({
      name: '',
      client: '',
      quantity: 1,
      printType: PrintTypes.LASER,
      deliveryMethod: DeliveryMethods.COURIER,
      manager: currentUser
    });
    
    setFormVisible(false);
  };

  // 로그인 처리
  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginCredentials(prev => ({ ...prev, [name]: value }));
  };

  // 로그인 시도
  const handleLogin = () => {
    setLoginError('');
    
    // 간단한 검증
    if (!loginCredentials.username || !loginCredentials.password) {
      setLoginError('아이디와 비밀번호를 모두 입력해주세요.');
      return;
    }
    
    // 사용자 이름으로 스태프 찾기 (간단한 매칭)
    const user = staff.find(s => 
      s.name === loginCredentials.username || 
      s.name.includes(loginCredentials.username)
    );
    
    if (user && loginCredentials.password === '1234') { // 간단한 비밀번호 확인 (모두 1234로 설정)
      setCurrentUser(user);
      setIsLoggedIn(true);
      setLoginVisible(false);
      // 로그인 후 폼 초기화
      setLoginCredentials({ username: '', password: '' });
    } else {
      setLoginError('아이디 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  // 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoginVisible(false);
  };

  // 파일 업로드 처리
  const handleFileUpload = (e) => {
    setFileError('');
    const file = e.target.files[0];
    if (!file) return;

    alert('파일 업로드 기능은 실제 구현 시 파일 처리 라이브러리가 필요합니다.');
    setUploadVisible(false);
  };

  // 새로고침 처리
  const handleRefresh = () => {
    setIsUpdating(true);
    setTimeout(() => setIsUpdating(false), 500);
  };

  // 아이콘 가져오기
  const stageIcons = {
    '입고': <Warehouse />,
    '인쇄 컨펌': <CheckCircle2 />,
    '인쇄 중': <Printer />,
    '포장': <Package />,
    '발송': <Truck />
  };

  // 아이콘 함수
  const getPrintTypeIcon = (printType) => {
    switch (printType) {
      case PrintTypes.LASER: return <Printer className="text-blue-500" />;
      case PrintTypes.TRANSFER: return <Info className="text-green-500" />;
      case PrintTypes.NO_PRINT: return <X className="text-red-500" />;
      case PrintTypes.SCREEN: return <Printer className="text-purple-500" />;
      case PrintTypes.DIGITAL: return <Printer className="text-orange-500" />;
      default: return <Printer />;
    }
  };

  // 아이콘 함수
  const getDeliveryMethodIcon = (deliveryMethod) => {
    switch (deliveryMethod) {
      case DeliveryMethods.DIRECT_PICKUP: return <ShoppingBag className="text-blue-500" />;
      case DeliveryMethods.COURIER: return <Truck className="text-green-500" />;
      case DeliveryMethods.QUICK_SERVICE: return <MapPin className="text-red-500" />;
      default: return <Truck />;
    }
  };

  // 진행 중인 상품 목록 (발송 완료되지 않은 상품)
  const uncompletedProducts = products.filter(product => 
    !product.stages[product.stages.length - 1].completed
  );

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* 현재 날짜 표시 */}
      <div className="text-right text-gray-600 mb-2">
        <span className="text-xl font-semibold">
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })}
        </span>
      </div>
      
      {/* 로그인 상태 표시 및 버튼 */}
      <div className="flex justify-end mb-4">
        {isLoggedIn ? (
          <div className="flex items-center">
            <span className="text-sm mr-2">
              <span className="font-medium">{currentUser.name}</span> ({currentUser.department}) 로그인 중
            </span>
            <button 
              onClick={handleLogout}
              className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300"
            >
              로그아웃
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setLoginVisible(true)}
            className="flex items-center px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
          >
            <User size={16} className="mr-1" />
            로그인
          </button>
        )}
      </div>

      {/* 로그인 폼 */}
      {loginVisible && !isLoggedIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">로그인</h2>
            
            {loginError && (
              <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
                {loginError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자 이름</label>
              <input
                type="text"
                name="username"
                value={loginCredentials.username}
                onChange={handleLoginChange}
                placeholder="이름을 입력하세요"
                className="w-full p-2 border rounded"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">비밀번호</label>
              <input
                type="password"
                name="password"
                value={loginCredentials.password}
                onChange={handleLoginChange}
                placeholder="비밀번호를 입력하세요"
                className="w-full p-2 border rounded"
              />
              <span className="text-xs text-gray-500 mt-1">테스트용 비밀번호: 1234</span>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLoginVisible(false)}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
              >
                취소
              </button>
              <button
                onClick={handleLogin}
                className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <LogIn size={18} className="mr-1" />
                로그인
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">판촉물 생산 추적 대시보드</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setFormVisible(true)}
            className="flex items-center space-x-2 p-2 rounded-md bg-blue-100 text-blue-600 hover:bg-blue-200"
          >
            <PlusCircle size={18} />
            <span className="text-sm">신규 상품 추가</span>
          </button>
          
          <button
            onClick={() => setUploadVisible(true)}
            className="flex items-center space-x-2 p-2 rounded-md bg-purple-100 text-purple-600 hover:bg-purple-200"
          >
            <Upload size={18} />
            <span className="text-sm">파일에서 가져오기</span>
          </button>
          
          <button
            onClick={handleRefresh}
            className={`flex items-center space-x-2 p-2 rounded-md ${
              isUpdating ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <RefreshCw size={18} className={isUpdating ? "animate-spin" : ""} />
            <span className="text-sm">
              {isUpdating ? '업데이트 중...' : '상태 업데이트'}
            </span>
          </button>
        </div>
      </div>
      
      {/* 포장 완료 & 발송 대기 상품 표시 */}
      {uncompletedProducts.filter(p => p.stages[3].completed && !p.stages[4].completed).length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-orange-700">발송 대기 상품</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-orange-50 shadow-md rounded-lg">
              <thead>
                <tr className="bg-orange-100 border-b">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">상품명</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">클라이언트</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">수량</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">담당자</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">포장일</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">배송</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody>
                {uncompletedProducts
                  .filter(p => p.stages[3].completed && !p.stages[4].completed)
                  .map((product, idx) => (
                    <tr key={`waiting-${product.id}`} className="border-b border-orange-100">
                      <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.client}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.quantity.toLocaleString()}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.manager.name}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.stages[3].date}</td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                        <div className="flex items-center">
                          {getDeliveryMethodIcon(product.deliveryMethod)}
                          <span className="ml-1 text-xs">{product.deliveryMethod}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                        <button 
                          onClick={() => handleStatusUpdate(product.id, 4)}
                          className="px-2 py-1 bg-blue-100 text-blue-600 rounded-md text-xs hover:bg-blue-200"
                        >
                          발송 완료
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 발송 완료된 상품 표시 */}
      {completedShipments.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2 text-green-700">최근 발송 완료 상품</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-green-50 shadow-md rounded-lg">
              <thead>
                <tr className="bg-green-100 border-b">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">상품명</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">클라이언트</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">수량</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">담당자</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">발송일</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">배송</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody>
                {completedShipments.map((product, idx) => (
                  <tr key={`completed-${product.id}`} className="border-b border-green-100">
                    <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.client}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.quantity.toLocaleString()}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.manager.name}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.stages[4].date}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        {getDeliveryMethodIcon(product.deliveryMethod)}
                        <span className="ml-1 text-xs">{product.deliveryMethod}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                      <button 
                        onClick={() => handleStatusUpdate(product.id, product.stages.length - 1)}
                        className="px-2 py-1 bg-red-100 text-red-600 rounded-md text-xs hover:bg-red-200"
                      >
                        발송 취소
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* 파일 업로드 폼 */}
      {uploadVisible && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">파일에서 상품 가져오기</h2>
          
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">
              CSV 또는 Excel 파일을 업로드하세요. 파일은 다음 열을 포함해야 합니다:
            </p>
            <ul className="list-disc pl-5 text-sm text-gray-600 mb-4">
              <li>name (필수): 상품명</li>
              <li>client (필수): 클라이언트</li>
              <li>quantity (선택): 수량 (1~10000 사이의 숫자, 입력하지 않으면 기본값 1)</li>
              <li>manager_id (선택): 담당자 ID (1~7, 입력하지 않으면 랜덤 배정)</li>
              <li>printType (선택): 인쇄 타입 (레이저 인쇄, 전사 인쇄, 인쇄 없음 등)</li>
              <li>deliveryMethod (선택): 배송 방법 (직접 인수, 택배, 퀵 서비스)</li>
            </ul>
            
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">클릭하여 파일 선택</span></p>
                  <p className="text-xs text-gray-500">CSV 또는 Excel 파일 (XLSX, XLS)</p>
                </div>
                <input 
                  type="file" 
                  className="hidden" 
                  accept=".csv,.xlsx,.xls" 
                  onChange={handleFileUpload}
                />
              </label>
            </div>
            
            {fileError && (
              <div className="text-red-500 text-sm mt-2">{fileError}</div>
            )}
            
            <div className="mt-4 text-center">
              <p className="text-sm font-medium mb-2">예시 파일 다운로드</p>
              <div className="flex justify-center space-x-4">
                <a 
                  href="/sample-files/promotional-products-sample.csv" 
                  download="promotional-products-sample.csv"
                  className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200"
                  onClick={(e) => {
                    e.preventDefault(); 
                    alert('실제 구현 시 이 버튼은 샘플 CSV 파일을 다운로드합니다.');
                  }}
                >
                  CSV 샘플 다운로드
                </a>
                <a 
                  href="/sample-files/promotional-products-sample.xlsx" 
                  download="promotional-products-sample.xlsx"
                  className="px-3 py-1 bg-green-100 text-green-600 rounded text-sm hover:bg-green-200"
                  onClick={(e) => {
                    e.preventDefault(); 
                    alert('실제 구현 시 이 버튼은 샘플 Excel 파일을 다운로드합니다.');
                  }}
                >
                  Excel 샘플 다운로드
                </a>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => {
                setUploadVisible(false);
                setFileError('');
              }}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              취소
            </button>
          </div>
        </div>
      )}
      
      {/* 새 상품 추가 폼 */}
      {formVisible && (
        <div className="bg-white shadow-md rounded-lg p-4 mb-4">
          <h2 className="text-lg font-semibold mb-4">신규 상품 추가</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상품명 *</label>
              <input
                type="text"
                name="name"
                value={newProduct.name}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
                placeholder="상품명 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">클라이언트 *</label>
              <input
                type="text"
                name="client"
                value={newProduct.client}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
                placeholder="클라이언트명 입력"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">수량 *</label>
              <input
                type="number"
                name="quantity"
                min="1"
                max="10000"
                value={newProduct.quantity}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
                placeholder="수량 입력"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">담당자</label>
              <select
                name="manager"
                value={newProduct.manager ? newProduct.manager.id : ''}
                onChange={handleManagerChange}
                className="w-full p-2 border rounded"
              >
                {staff.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name} ({person.department})
                    {person.id === currentUser.id ? ' (나)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">인쇄 타입</label>
              <select
                name="printType"
                value={newProduct.printType}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
              >
                {Object.entries(PrintTypes).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">배송 방법</label>
              <select
                name="deliveryMethod"
                value={newProduct.deliveryMethod}
                onChange={handleNewProductChange}
                className="w-full p-2 border rounded"
              >
                {Object.entries(DeliveryMethods).map(([key, value]) => (
                  <option key={key} value={value}>{value}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setFormVisible(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded hover:bg-gray-200"
            >
              취소
            </button>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
            >
              <Save size={18} className="mr-1" /> 저장
            </button>
          </div>
        </div>
      )}
      
      {/* 제품 목록 - 발송되지 않은 상품만 표시 */}
      {uncompletedProducts.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          현재 진행 중인 제품이 없습니다.
        </div>
      ) : (
        <>
          <h2 className="text-lg font-semibold mb-2">당일 발송 진행중인 판촉물</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow-md rounded-lg">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품명</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">클라이언트</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수량</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">담당자</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">인쇄</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">배송</th>
                  <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody>
                {uncompletedProducts.map((product, idx) => (
                  <tr key={product.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">{product.id}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.name}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.client}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.quantity.toLocaleString()}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">{product.manager.name}</td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        {getPrintTypeIcon(product.printType)}
                        <span className="ml-1 text-xs">{product.printType}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex items-center">
                        {getDeliveryMethodIcon(product.deliveryMethod)}
                        <span className="ml-1 text-xs">{product.deliveryMethod}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-700">
                      <div className="flex space-x-1 items-center">
                        {product.stages.slice(0, 4).map((stage, index) => (
                          <button 
                            key={stage.name}
                            onClick={() => handleStatusUpdate(product.id, index)}
                            className={`p-1 rounded-full ${
                              stage.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                            } hover:bg-blue-100 hover:text-blue-600 transition-colors`}
                            title={`${stage.name} - ${stage.completed ? '완료됨' : '미완료'}`}
                          >
                            {stageIcons[stage.name]}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductStatusTracker;