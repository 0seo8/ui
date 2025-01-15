import { mockData } from "../mocks/data";

// 템플릿 목록 조회
export const getTemplates = async () => {
  try {
    // 목업 데이터의 모든 템플릿 반환
    return Object.values(mockData).flat();
  } catch (error) {
    console.error("템플릿 목록 조회 오류:", error);
    throw error;
  }
};

// 템플릿 상세 조회
export const getTemplate = async (templateId) => {
  try {
    // 목업 데이터에서 해당 템플릿 찾기
    const template = mockData[templateId];
    if (!template) throw new Error("템플릿을 찾을 수 없습니다.");
    return template;
  } catch (error) {
    console.error("템플릿 조회 오류:", error);
    throw error;
  }
};

// 템플릿 저장 (목업)
export const saveTemplate = async (templateData) => {
  try {
    // 저장 성공 시뮬레이션
    return { ...templateData, id: Date.now().toString() };
  } catch (error) {
    console.error("템플릿 저장 오류:", error);
    throw error;
  }
};

// 템플릿 수정 (목업)
export const updateTemplate = async (templateId, templateData) => {
  try {
    // 수정 성공 시뮬레이션
    return { ...templateData, id: templateId };
  } catch (error) {
    console.error("템플릿 수정 오류:", error);
    throw error;
  }
};

// 템플릿 삭제 (목업)
export const deleteTemplate = async (templateId) => {
  try {
    // 삭제 성공 시뮬레이션
    return { success: true };
  } catch (error) {
    console.error("템플릿 삭제 오류:", error);
    throw error;
  }
};
