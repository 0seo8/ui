export const mockData = {
  cca659dac3b18d98643c23bfdea32d69b2d647576ac2c5b33ea9c2e4700d53cb: [
    {
      leaflet_id: 1,
      docs_id:
        "cca659dac3b18d98643c23bfdea32d69b2d647576ac2c5b33ea9c2e4700d53cb",
      answer:
        "I.보험종류\n<table><tr><td>보험종목의 명칭</td><td>환급금 형태</td></tr><tr><td>KB toss착한암보험 무배당</td><td>표준형</td></tr><tr><td>KB toss착한암보험 무배당(해약환급금 미지급형)</td><td>해약환급금 미지급형</td></tr></table>",
      query: "보험종류",
      tenant_id: 7,
      cmetadata: {
        title: "가입안내",
        subtitle: "보험종류",
      },
    },
    {
      leaflet_id: 2,
      docs_id:
        "cca659dac3b18d98643c23bfdea32d69b2d647576ac2c5b33ea9c2e4700d53cb",
      answer:
        ". 보험기간, 보험료 납입기간, 가입나이, 납입주기\n<table><tr><td>구분</td><td>보험기간</td><td>보험료 납입기간</td><td>가입나이</td><td>납입주기</td></tr><tr><td rowspan='2'>KB toss착한암보험 무배당 KB toss착한암보험 무배당 (해약환급금 미지급형)</td><td>80세만기</td><td rowspan='2'>전기납</td><td>만19세~60세</td><td rowspan='2'>월납</td></tr><tr><td>100세만기</td><td>만19세~60세</td></tr></table>",
      query: "가입조건",
      tenant_id: 7,
      cmetadata: {
        title: "가입안내",
        subtitle: "가입조건",
      },
    },
    {
      leaflet_id: 3,
      docs_id:
        "cca659dac3b18d98643c23bfdea32d69b2d647576ac2c5b33ea9c2e4700d53cb",
      answer:
        "\n. 해약환급금 예시\n(1) 표준형\n(기준 : 가입나이 40세, 80세만기, 전기납, 월납, 보험가입금액 3,000만, 단위 : 원)\n<table><tr><td rowspan='2'>경과\n기간</td><td colspan='3'>남자</td><td colspan='3'>여자</td></tr><tr><td>납입보험료\n누계(A)</td><td>해약환급금\n(B)</td><td>환급률(B/A)</td><td>납입보험료\n누계(A)</td><td>해약환급금\n\n(B)</td><td>환급률(B/A)</td></tr><tr><td>3월</td><td>94,140</td><td>0</td><td>0.00%</td><td>56,250</td><td>0</td><td>0.00%</td></tr></table>",
      query: "보험료/환급금 예시",
      tenant_id: 7,
      cmetadata: {
        title: "상품안내",
        subtitle: "보험료/환급금 예시",
      },
    },
    {
      leaflet_id: 4,
      docs_id:
        "cca659dac3b18d98643c23bfdea32d69b2d647576ac2c5b33ea9c2e4700d53cb",
      answer:
        'KB toss착한암보험 무배당\n[기준 : 보험가입금액 1,000만원]\n<table><tr><td>급부명</td><td>지급사유</td><td>지급금액</td></tr><tr><td rowspan=\'2\'>암진단\n보험금</td><td>피보험자가 보험기간 중 "암보장개시\n일" 이후에 "암"으로 진단확정 되었을\n때\n[다만, 각각 최초 1회에 한함]</td><td>고액암\n:\n2,000만원(1년 이상)\n:\n1,000만원(1년 미만)</td></tr></table>',
      query: "주계약 보장내용",
      tenant_id: 7,
      cmetadata: {
        title: "상품안내",
        subtitle: "주계약 보장내용",
      },
    },
  ],
};

// HTML 테이블 문자열을 파싱하여 데이터 구조로 변환
export const parseTableFromHtml = (htmlString) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");
  const table = doc.querySelector("table");
  if (!table) return null;

  const rows = Array.from(table.rows);
  const tableData = {
    headers: [],
    rows: [],
    rowSpans: {},
    colSpans: {},
  };

  // 헤더 처리
  const headerRow = rows[0];
  if (headerRow) {
    tableData.headers = Array.from(headerRow.cells).map((cell, colIndex) => {
      const rowSpan = parseInt(cell.getAttribute("rowspan") || "1");
      const colSpan = parseInt(cell.getAttribute("colspan") || "1");

      if (rowSpan > 1) {
        tableData.rowSpans[`0-${colIndex}`] = rowSpan;
      }
      if (colSpan > 1) {
        tableData.colSpans[`0-${colIndex}`] = colSpan;
      }

      return cell.textContent.trim();
    });
  }

  // 데이터 행 처리
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex++) {
    const row = rows[rowIndex];
    const rowData = Array.from(row.cells).map((cell, colIndex) => {
      const rowSpan = parseInt(cell.getAttribute("rowspan") || "1");
      const colSpan = parseInt(cell.getAttribute("colspan") || "1");

      if (rowSpan > 1) {
        tableData.rowSpans[`${rowIndex}-${colIndex}`] = rowSpan;
      }
      if (colSpan > 1) {
        tableData.colSpans[`${rowIndex}-${colIndex}`] = colSpan;
      }

      return cell.textContent.trim();
    });
    tableData.rows.push(rowData);
  }

  return tableData;
};

// 데이터 구조를 HTML 테이블 문자열로 변환
export const convertTableToHtml = (tableData) => {
  if (!tableData) return "";

  let html = "<table>";

  // 헤더 생성
  if (tableData.headers.length > 0) {
    html += "<tr>";
    tableData.headers.forEach((header, colIndex) => {
      const rowSpan = tableData.rowSpans[`0-${colIndex}`] || 1;
      const colSpan = tableData.colSpans[`0-${colIndex}`] || 1;
      html += `<td${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ""}${
        colSpan > 1 ? ` colspan="${colSpan}"` : ""
      }>${header}</td>`;
    });
    html += "</tr>";
  }

  // 데이터 행 생성
  tableData.rows.forEach((row, rowIndex) => {
    html += "<tr>";
    row.forEach((cell, colIndex) => {
      const rowSpan = tableData.rowSpans[`${rowIndex + 1}-${colIndex}`] || 1;
      const colSpan = tableData.colSpans[`${rowIndex + 1}-${colIndex}`] || 1;
      html += `<td${rowSpan > 1 ? ` rowspan="${rowSpan}"` : ""}${
        colSpan > 1 ? ` colspan="${colSpan}"` : ""
      }>${cell}</td>`;
    });
    html += "</tr>";
  });

  html += "</table>";
  return html;
};
