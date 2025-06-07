/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "(pages-dir-browser)/./src/workers/networkWorker.js":
/*!**************************************!*\
  !*** ./src/workers/networkWorker.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("/* eslint-disable no-restricted-globals */ // 네트워크 필터링 및 중심성 계산 워커\n// export type Network = {\n//   id: number\n//   nationality: string\n//   ethnicity: string\n//   migration_year: number\n//   user_name: string\n//   type: string\n//   edges: { edgeType: string; targetId: number }[]\n//   migration_traces: { reason: string }[]\n// }\n// export type FilterOptions = {\n//   nationality: string[] | string\n//   ethnicity: string[] | string\n//   edgeType: string[] | string\n//   entityType: string\n//   yearRange: [number, number]\n//   migrationYearRange: [number, number] // 추가\n//   userNetworkFilter: boolean\n//   userNetworkTraceFilter: boolean\n//   userNetworkConnectionFilter: boolean\n//   migrationReasons: string[]\n//   selectedMigrationNetworkId: number | null\n// }\nfunction filterNetworks(networks, filters, selectedEdgeId, userName) {\n    const total = networks.length;\n    let filtered = [];\n    self.postMessage({\n        type: \"PROGRESS\",\n        payload: 0\n    });\n    networks.forEach((network, idx)=>{\n        // 국적 필터\n        const matchesNationality = filters.nationality.includes(\"all\") || filters.nationality.includes(network.nationality) || filters.nationality === \"all\" || network.nationality === filters.nationality;\n        // 민족 필터\n        const matchesEthnicity = filters.ethnicity.includes(\"all\") || filters.ethnicity.includes(network.ethnicity) || filters.ethnicity === \"all\" || network.ethnicity === filters.ethnicity;\n        // 연도 필터\n        const matchesYearRange = network.migration_year >= filters.yearRange[0] && network.migration_year <= filters.yearRange[1];\n        // 이동연도(이주연도) 필터: migration_traces 중 하나라도 migrationYearRange에 포함되면 통과\n        const matchesMigrationYearRange = !filters.migrationYearRange || filters.migrationYearRange.length !== 2 || network.migration_traces.some((trace)=>trace.migration_year >= filters.migrationYearRange[0] && trace.migration_year <= filters.migrationYearRange[1]);\n        // 유저 네트워크 필터\n        const matchesUserNetwork = !filters.userNetworkFilter || !userName || network.user_name === userName;\n        // 엣지 필터\n        const matchesEdge = !selectedEdgeId || network.edges.some((edge)=>edge.targetId === selectedEdgeId);\n        // 엔티티 타입 필터\n        const matchesEntityType = filters.entityType === \"all\" || (Array.isArray(filters.entityType) ? filters.entityType.includes(\"all\") || filters.entityType.includes(network.type) : network.type === filters.entityType);\n        // 엣지 타입 필터 (멀티 지원)\n        let matchesEdgeType = true;\n        if (filters.edgeType && filters.edgeType.length > 0 && !filters.edgeType.includes(\"all\")) {\n            matchesEdgeType = network.edges.some((edge)=>Array.isArray(filters.edgeType) ? filters.edgeType.includes(edge.edgeType) : filters.edgeType === edge.edgeType);\n        }\n        // 이주 원인 필터\n        const matchesMigrationReasons = filters.migrationReasons.includes(\"all\") || filters.migrationReasons.length === 0 || network.migration_traces.some((trace)=>filters.migrationReasons.includes(trace.reason));\n        // 여러 네트워크 필터\n        const matchesSelectedMigrationNetworks = !filters.selectedMigrationNetworkIds || filters.selectedMigrationNetworkIds.length === 0 || filters.selectedMigrationNetworkIds.includes(network.id);\n        const matches = matchesNationality && matchesEthnicity && matchesYearRange && matchesMigrationYearRange && matchesUserNetwork && matchesEdge && matchesEntityType && matchesMigrationReasons && matchesSelectedMigrationNetworks && matchesEdgeType // 추가\n        ;\n        if (matches) filtered.push(network);\n        // 5% 단위로 진행률 메시지 전송 (혹은 100개마다 등)\n        if (idx % Math.ceil(total / 20) === 0 || idx === total - 1) {\n            const percent = Math.round((idx + 1) / total * 100);\n            self.postMessage({\n                type: \"PROGRESS\",\n                payload: percent\n            });\n        }\n    });\n    return filtered;\n}\n// 중심성 계산 (예시: degree centrality)\nfunction calculateCentrality(filteredNetworks, centralityType) {\n    const centrality = {};\n    if (centralityType === \"degree\") {\n        filteredNetworks.forEach((network)=>{\n            centrality[network.id] = network.edges.length;\n        });\n    } else if (centralityType === \"none\") {\n        filteredNetworks.forEach((network)=>{\n            centrality[network.id] = 1;\n        });\n    }\n    // 필요시 다른 중심성도 추가\n    return centrality;\n}\nself.onmessage = function(e) {\n    const { type, payload } = e.data;\n    if (type === \"FILTER_NETWORKS\") {\n        self.postMessage({\n            type: \"PROGRESS\",\n            payload: 0\n        }) // 반드시 0부터 시작!\n        ;\n        const filtered = filterNetworks(payload.networks, payload.filters, payload.selectedEdgeId, payload.userName);\n        self.postMessage({\n            type: \"FILTERED_NETWORKS\",\n            payload: filtered\n        });\n        self.postMessage({\n            type: \"PROGRESS\",\n            payload: 100\n        }) // 마지막에 100!\n        ;\n    }\n    if (type === \"CALCULATE_CENTRALITY\") {\n        const { filteredNetworks, centralityType } = payload;\n        const result = calculateCentrality(filteredNetworks, centralityType);\n        self.postMessage({\n            type: \"CENTRALITY_RESULT\",\n            payload: result\n        });\n    }\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHBhZ2VzLWRpci1icm93c2VyKS8uL3NyYy93b3JrZXJzL25ldHdvcmtXb3JrZXIuanMiLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDLEdBRXhDLHVCQUF1QjtBQUV2QiwwQkFBMEI7QUFDMUIsZUFBZTtBQUNmLHdCQUF3QjtBQUN4QixzQkFBc0I7QUFDdEIsMkJBQTJCO0FBQzNCLHNCQUFzQjtBQUN0QixpQkFBaUI7QUFDakIsb0RBQW9EO0FBQ3BELDJDQUEyQztBQUMzQyxJQUFJO0FBRUosZ0NBQWdDO0FBQ2hDLG1DQUFtQztBQUNuQyxpQ0FBaUM7QUFDakMsZ0NBQWdDO0FBQ2hDLHVCQUF1QjtBQUN2QixnQ0FBZ0M7QUFDaEMsK0NBQStDO0FBQy9DLCtCQUErQjtBQUMvQixvQ0FBb0M7QUFDcEMseUNBQXlDO0FBQ3pDLCtCQUErQjtBQUMvQiw4Q0FBOEM7QUFDOUMsSUFBSTtBQUVKLFNBQVNBLGVBQWVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxjQUFjLEVBQUVDLFFBQVE7SUFDakUsTUFBTUMsUUFBUUosU0FBU0ssTUFBTTtJQUM3QixJQUFJQyxXQUFXLEVBQUU7SUFDakJDLEtBQUtDLFdBQVcsQ0FBQztRQUFFQyxNQUFNO1FBQVlDLFNBQVM7SUFBRTtJQUVoRFYsU0FBU1csT0FBTyxDQUFDLENBQUNDLFNBQVNDO1FBQ3pCLFFBQVE7UUFDUixNQUFNQyxxQkFDSmIsUUFBUWMsV0FBVyxDQUFDQyxRQUFRLENBQUMsVUFDN0JmLFFBQVFjLFdBQVcsQ0FBQ0MsUUFBUSxDQUFDSixRQUFRRyxXQUFXLEtBQ2hEZCxRQUFRYyxXQUFXLEtBQUssU0FDeEJILFFBQVFHLFdBQVcsS0FBS2QsUUFBUWMsV0FBVztRQUU3QyxRQUFRO1FBQ1IsTUFBTUUsbUJBQ0poQixRQUFRaUIsU0FBUyxDQUFDRixRQUFRLENBQUMsVUFDM0JmLFFBQVFpQixTQUFTLENBQUNGLFFBQVEsQ0FBQ0osUUFBUU0sU0FBUyxLQUM1Q2pCLFFBQVFpQixTQUFTLEtBQUssU0FDdEJOLFFBQVFNLFNBQVMs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XERlc2t0b3BcXE1JR05FVFZVX1VJXFxzcmNcXHdvcmtlcnNcXG5ldHdvcmtXb3JrZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyogZXNsaW50LWRpc2FibGUgbm8tcmVzdHJpY3RlZC1nbG9iYWxzICovXHJcblxyXG4vLyDrhKTtirjsm4ztgawg7ZWE7YSw66eBIOuwjyDspJHsi6zshLEg6rOE7IKwIOybjOy7pFxyXG5cclxuLy8gZXhwb3J0IHR5cGUgTmV0d29yayA9IHtcclxuLy8gICBpZDogbnVtYmVyXHJcbi8vICAgbmF0aW9uYWxpdHk6IHN0cmluZ1xyXG4vLyAgIGV0aG5pY2l0eTogc3RyaW5nXHJcbi8vICAgbWlncmF0aW9uX3llYXI6IG51bWJlclxyXG4vLyAgIHVzZXJfbmFtZTogc3RyaW5nXHJcbi8vICAgdHlwZTogc3RyaW5nXHJcbi8vICAgZWRnZXM6IHsgZWRnZVR5cGU6IHN0cmluZzsgdGFyZ2V0SWQ6IG51bWJlciB9W11cclxuLy8gICBtaWdyYXRpb25fdHJhY2VzOiB7IHJlYXNvbjogc3RyaW5nIH1bXVxyXG4vLyB9XHJcblxyXG4vLyBleHBvcnQgdHlwZSBGaWx0ZXJPcHRpb25zID0ge1xyXG4vLyAgIG5hdGlvbmFsaXR5OiBzdHJpbmdbXSB8IHN0cmluZ1xyXG4vLyAgIGV0aG5pY2l0eTogc3RyaW5nW10gfCBzdHJpbmdcclxuLy8gICBlZGdlVHlwZTogc3RyaW5nW10gfCBzdHJpbmdcclxuLy8gICBlbnRpdHlUeXBlOiBzdHJpbmdcclxuLy8gICB5ZWFyUmFuZ2U6IFtudW1iZXIsIG51bWJlcl1cclxuLy8gICBtaWdyYXRpb25ZZWFyUmFuZ2U6IFtudW1iZXIsIG51bWJlcl0gLy8g7LaU6rCAXHJcbi8vICAgdXNlck5ldHdvcmtGaWx0ZXI6IGJvb2xlYW5cclxuLy8gICB1c2VyTmV0d29ya1RyYWNlRmlsdGVyOiBib29sZWFuXHJcbi8vICAgdXNlck5ldHdvcmtDb25uZWN0aW9uRmlsdGVyOiBib29sZWFuXHJcbi8vICAgbWlncmF0aW9uUmVhc29uczogc3RyaW5nW11cclxuLy8gICBzZWxlY3RlZE1pZ3JhdGlvbk5ldHdvcmtJZDogbnVtYmVyIHwgbnVsbFxyXG4vLyB9XHJcblxyXG5mdW5jdGlvbiBmaWx0ZXJOZXR3b3JrcyhuZXR3b3JrcywgZmlsdGVycywgc2VsZWN0ZWRFZGdlSWQsIHVzZXJOYW1lKSB7XHJcbiAgY29uc3QgdG90YWwgPSBuZXR3b3Jrcy5sZW5ndGhcclxuICBsZXQgZmlsdGVyZWQgPSBbXVxyXG4gIHNlbGYucG9zdE1lc3NhZ2UoeyB0eXBlOiBcIlBST0dSRVNTXCIsIHBheWxvYWQ6IDAgfSlcclxuXHJcbiAgbmV0d29ya3MuZm9yRWFjaCgobmV0d29yaywgaWR4KSA9PiB7XHJcbiAgICAvLyDqta3soIEg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzTmF0aW9uYWxpdHkgPVxyXG4gICAgICBmaWx0ZXJzLm5hdGlvbmFsaXR5LmluY2x1ZGVzKFwiYWxsXCIpIHx8XHJcbiAgICAgIGZpbHRlcnMubmF0aW9uYWxpdHkuaW5jbHVkZXMobmV0d29yay5uYXRpb25hbGl0eSkgfHxcclxuICAgICAgZmlsdGVycy5uYXRpb25hbGl0eSA9PT0gXCJhbGxcIiB8fFxyXG4gICAgICBuZXR3b3JrLm5hdGlvbmFsaXR5ID09PSBmaWx0ZXJzLm5hdGlvbmFsaXR5XHJcblxyXG4gICAgLy8g66+87KGxIO2VhO2EsFxyXG4gICAgY29uc3QgbWF0Y2hlc0V0aG5pY2l0eSA9XHJcbiAgICAgIGZpbHRlcnMuZXRobmljaXR5LmluY2x1ZGVzKFwiYWxsXCIpIHx8XHJcbiAgICAgIGZpbHRlcnMuZXRobmljaXR5LmluY2x1ZGVzKG5ldHdvcmsuZXRobmljaXR5KSB8fFxyXG4gICAgICBmaWx0ZXJzLmV0aG5pY2l0eSA9PT0gXCJhbGxcIiB8fFxyXG4gICAgICBuZXR3b3JrLmV0aG5pY2l0eSA9PT0gZmlsdGVycy5ldGhuaWNpdHlcclxuXHJcbiAgICAvLyDsl7Drj4Qg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzWWVhclJhbmdlID1cclxuICAgICAgbmV0d29yay5taWdyYXRpb25feWVhciA+PSBmaWx0ZXJzLnllYXJSYW5nZVswXSAmJlxyXG4gICAgICBuZXR3b3JrLm1pZ3JhdGlvbl95ZWFyIDw9IGZpbHRlcnMueWVhclJhbmdlWzFdXHJcblxyXG4gICAgLy8g7J2064+Z7Jew64+EKOydtOyjvOyXsOuPhCkg7ZWE7YSwOiBtaWdyYXRpb25fdHJhY2VzIOykkSDtlZjrgpjrnbzrj4QgbWlncmF0aW9uWWVhclJhbmdl7JeQIO2PrO2VqOuQmOuptCDthrXqs7xcclxuICAgIGNvbnN0IG1hdGNoZXNNaWdyYXRpb25ZZWFyUmFuZ2UgPVxyXG4gICAgICAhZmlsdGVycy5taWdyYXRpb25ZZWFyUmFuZ2UgfHxcclxuICAgICAgZmlsdGVycy5taWdyYXRpb25ZZWFyUmFuZ2UubGVuZ3RoICE9PSAyIHx8XHJcbiAgICAgIG5ldHdvcmsubWlncmF0aW9uX3RyYWNlcy5zb21lKFxyXG4gICAgICAgICh0cmFjZSkgPT5cclxuICAgICAgICAgIHRyYWNlLm1pZ3JhdGlvbl95ZWFyID49IGZpbHRlcnMubWlncmF0aW9uWWVhclJhbmdlWzBdICYmXHJcbiAgICAgICAgICB0cmFjZS5taWdyYXRpb25feWVhciA8PSBmaWx0ZXJzLm1pZ3JhdGlvblllYXJSYW5nZVsxXSxcclxuICAgICAgKVxyXG5cclxuICAgIC8vIOycoOyggCDrhKTtirjsm4ztgawg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzVXNlck5ldHdvcmsgPVxyXG4gICAgICAhZmlsdGVycy51c2VyTmV0d29ya0ZpbHRlciB8fCAhdXNlck5hbWUgfHwgbmV0d29yay51c2VyX25hbWUgPT09IHVzZXJOYW1lXHJcblxyXG4gICAgLy8g7Jej7KeAIO2VhO2EsFxyXG4gICAgY29uc3QgbWF0Y2hlc0VkZ2UgPVxyXG4gICAgICAhc2VsZWN0ZWRFZGdlSWQgfHxcclxuICAgICAgbmV0d29yay5lZGdlcy5zb21lKChlZGdlKSA9PiBlZGdlLnRhcmdldElkID09PSBzZWxlY3RlZEVkZ2VJZClcclxuXHJcbiAgICAvLyDsl5Tti7Dti7Ag7YOA7J6FIO2VhO2EsFxyXG4gICAgY29uc3QgbWF0Y2hlc0VudGl0eVR5cGUgPVxyXG4gICAgICBmaWx0ZXJzLmVudGl0eVR5cGUgPT09IFwiYWxsXCIgfHxcclxuICAgICAgKEFycmF5LmlzQXJyYXkoZmlsdGVycy5lbnRpdHlUeXBlKVxyXG4gICAgICAgID8gZmlsdGVycy5lbnRpdHlUeXBlLmluY2x1ZGVzKFwiYWxsXCIpIHx8XHJcbiAgICAgICAgICBmaWx0ZXJzLmVudGl0eVR5cGUuaW5jbHVkZXMobmV0d29yay50eXBlKVxyXG4gICAgICAgIDogbmV0d29yay50eXBlID09PSBmaWx0ZXJzLmVudGl0eVR5cGUpXHJcblxyXG4gICAgLy8g7Jej7KeAIO2DgOyehSDtlYTthLAgKOupgO2LsCDsp4Dsm5ApXHJcbiAgICBsZXQgbWF0Y2hlc0VkZ2VUeXBlID0gdHJ1ZVxyXG4gICAgaWYgKFxyXG4gICAgICBmaWx0ZXJzLmVkZ2VUeXBlICYmXHJcbiAgICAgIGZpbHRlcnMuZWRnZVR5cGUubGVuZ3RoID4gMCAmJlxyXG4gICAgICAhZmlsdGVycy5lZGdlVHlwZS5pbmNsdWRlcyhcImFsbFwiKVxyXG4gICAgKSB7XHJcbiAgICAgIG1hdGNoZXNFZGdlVHlwZSA9IG5ldHdvcmsuZWRnZXMuc29tZSgoZWRnZSkgPT5cclxuICAgICAgICBBcnJheS5pc0FycmF5KGZpbHRlcnMuZWRnZVR5cGUpXHJcbiAgICAgICAgICA/IGZpbHRlcnMuZWRnZVR5cGUuaW5jbHVkZXMoZWRnZS5lZGdlVHlwZSlcclxuICAgICAgICAgIDogZmlsdGVycy5lZGdlVHlwZSA9PT0gZWRnZS5lZGdlVHlwZSxcclxuICAgICAgKVxyXG4gICAgfVxyXG5cclxuICAgIC8vIOydtOyjvCDsm5Dsnbgg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzTWlncmF0aW9uUmVhc29ucyA9XHJcbiAgICAgIGZpbHRlcnMubWlncmF0aW9uUmVhc29ucy5pbmNsdWRlcyhcImFsbFwiKSB8fFxyXG4gICAgICBmaWx0ZXJzLm1pZ3JhdGlvblJlYXNvbnMubGVuZ3RoID09PSAwIHx8XHJcbiAgICAgIG5ldHdvcmsubWlncmF0aW9uX3RyYWNlcy5zb21lKCh0cmFjZSkgPT5cclxuICAgICAgICBmaWx0ZXJzLm1pZ3JhdGlvblJlYXNvbnMuaW5jbHVkZXModHJhY2UucmVhc29uKSxcclxuICAgICAgKVxyXG5cclxuICAgIC8vIOyXrOufrCDrhKTtirjsm4ztgawg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzU2VsZWN0ZWRNaWdyYXRpb25OZXR3b3JrcyA9XHJcbiAgICAgICFmaWx0ZXJzLnNlbGVjdGVkTWlncmF0aW9uTmV0d29ya0lkcyB8fFxyXG4gICAgICBmaWx0ZXJzLnNlbGVjdGVkTWlncmF0aW9uTmV0d29ya0lkcy5sZW5ndGggPT09IDAgfHxcclxuICAgICAgZmlsdGVycy5zZWxlY3RlZE1pZ3JhdGlvbk5ldHdvcmtJZHMuaW5jbHVkZXMobmV0d29yay5pZClcclxuXHJcbiAgICBjb25zdCBtYXRjaGVzID1cclxuICAgICAgbWF0Y2hlc05hdGlvbmFsaXR5ICYmXHJcbiAgICAgIG1hdGNoZXNFdGhuaWNpdHkgJiZcclxuICAgICAgbWF0Y2hlc1llYXJSYW5nZSAmJlxyXG4gICAgICBtYXRjaGVzTWlncmF0aW9uWWVhclJhbmdlICYmXHJcbiAgICAgIG1hdGNoZXNVc2VyTmV0d29yayAmJlxyXG4gICAgICBtYXRjaGVzRWRnZSAmJlxyXG4gICAgICBtYXRjaGVzRW50aXR5VHlwZSAmJlxyXG4gICAgICBtYXRjaGVzTWlncmF0aW9uUmVhc29ucyAmJlxyXG4gICAgICBtYXRjaGVzU2VsZWN0ZWRNaWdyYXRpb25OZXR3b3JrcyAmJlxyXG4gICAgICBtYXRjaGVzRWRnZVR5cGUgLy8g7LaU6rCAXHJcblxyXG4gICAgaWYgKG1hdGNoZXMpIGZpbHRlcmVkLnB1c2gobmV0d29yaylcclxuXHJcbiAgICAvLyA1JSDri6jsnITroZwg7KeE7ZaJ66WgIOuplOyLnOyngCDsoITshqEgKO2YueydgCAxMDDqsJzrp4jri6Qg65OxKVxyXG4gICAgaWYgKGlkeCAlIE1hdGguY2VpbCh0b3RhbCAvIDIwKSA9PT0gMCB8fCBpZHggPT09IHRvdGFsIC0gMSkge1xyXG4gICAgICBjb25zdCBwZXJjZW50ID0gTWF0aC5yb3VuZCgoKGlkeCArIDEpIC8gdG90YWwpICogMTAwKVxyXG5cclxuICAgICAgc2VsZi5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiUFJPR1JFU1NcIiwgcGF5bG9hZDogcGVyY2VudCB9KVxyXG4gICAgfVxyXG4gIH0pXHJcblxyXG4gIHJldHVybiBmaWx0ZXJlZFxyXG59XHJcblxyXG4vLyDspJHsi6zshLEg6rOE7IKwICjsmIjsi5w6IGRlZ3JlZSBjZW50cmFsaXR5KVxyXG5mdW5jdGlvbiBjYWxjdWxhdGVDZW50cmFsaXR5KGZpbHRlcmVkTmV0d29ya3MsIGNlbnRyYWxpdHlUeXBlKSB7XHJcbiAgY29uc3QgY2VudHJhbGl0eSA9IHt9XHJcbiAgaWYgKGNlbnRyYWxpdHlUeXBlID09PSBcImRlZ3JlZVwiKSB7XHJcbiAgICBmaWx0ZXJlZE5ldHdvcmtzLmZvckVhY2goKG5ldHdvcmspID0+IHtcclxuICAgICAgY2VudHJhbGl0eVtuZXR3b3JrLmlkXSA9IG5ldHdvcmsuZWRnZXMubGVuZ3RoXHJcbiAgICB9KVxyXG4gIH0gZWxzZSBpZiAoY2VudHJhbGl0eVR5cGUgPT09IFwibm9uZVwiKSB7XHJcbiAgICBmaWx0ZXJlZE5ldHdvcmtzLmZvckVhY2goKG5ldHdvcmspID0+IHtcclxuICAgICAgY2VudHJhbGl0eVtuZXR3b3JrLmlkXSA9IDFcclxuICAgIH0pXHJcbiAgfVxyXG4gIC8vIO2VhOyalOyLnCDri6Trpbgg7KSR7Ius7ISx64+EIOy2lOqwgFxyXG4gIHJldHVybiBjZW50cmFsaXR5XHJcbn1cclxuXHJcbnNlbGYub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHtcclxuICBjb25zdCB7IHR5cGUsIHBheWxvYWQgfSA9IGUuZGF0YVxyXG5cclxuICBpZiAodHlwZSA9PT0gXCJGSUxURVJfTkVUV09SS1NcIikge1xyXG4gICAgc2VsZi5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiUFJPR1JFU1NcIiwgcGF5bG9hZDogMCB9KSAvLyDrsJjrk5zsi5wgMOu2gO2EsCDsi5zsnpEhXHJcbiAgICBjb25zdCBmaWx0ZXJlZCA9IGZpbHRlck5ldHdvcmtzKFxyXG4gICAgICBwYXlsb2FkLm5ldHdvcmtzLFxyXG4gICAgICBwYXlsb2FkLmZpbHRlcnMsXHJcbiAgICAgIHBheWxvYWQuc2VsZWN0ZWRFZGdlSWQsXHJcbiAgICAgIHBheWxvYWQudXNlck5hbWUsXHJcbiAgICApXHJcbiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJGSUxURVJFRF9ORVRXT1JLU1wiLCBwYXlsb2FkOiBmaWx0ZXJlZCB9KVxyXG4gICAgc2VsZi5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiUFJPR1JFU1NcIiwgcGF5bG9hZDogMTAwIH0pIC8vIOuniOyngOunieyXkCAxMDAhXHJcbiAgfVxyXG5cclxuICBpZiAodHlwZSA9PT0gXCJDQUxDVUxBVEVfQ0VOVFJBTElUWVwiKSB7XHJcbiAgICBjb25zdCB7IGZpbHRlcmVkTmV0d29ya3MsIGNlbnRyYWxpdHlUeXBlIH0gPSBwYXlsb2FkXHJcbiAgICBjb25zdCByZXN1bHQgPSBjYWxjdWxhdGVDZW50cmFsaXR5KGZpbHRlcmVkTmV0d29ya3MsIGNlbnRyYWxpdHlUeXBlKVxyXG4gICAgc2VsZi5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiQ0VOVFJBTElUWV9SRVNVTFRcIiwgcGF5bG9hZDogcmVzdWx0IH0pXHJcbiAgfVxyXG59XHJcbiJdLCJuYW1lcyI6WyJmaWx0ZXJOZXR3b3JrcyIsIm5ldHdvcmtzIiwiZmlsdGVycyIsInNlbGVjdGVkRWRnZUlkIiwidXNlck5hbWUiLCJ0b3RhbCIsImxlbmd0aCIsImZpbHRlcmVkIiwic2VsZiIsInBvc3RNZXNzYWdlIiwidHlwZSIsInBheWxvYWQiLCJmb3JFYWNoIiwibmV0d29yayIsImlkeCIsIm1hdGNoZXNOYXRpb25hbGl0eSIsIm5hdGlvbmFsaXR5IiwiaW5jbHVkZXMiLCJtYXRjaGVzRXRobmljaXR5IiwiZXRobmljaXR5IiwibWF0Y2hlc1llYXJSYW5nZSIsIm1pZ3JhdGlvbl95ZWFyIiwieWVhclJhbmdlIiwibWF0Y2hlc01pZ3JhdGlvblllYXJSYW5nZSIsIm1pZ3JhdGlvblllYXJSYW5nZSIsIm1pZ3JhdGlvbl90cmFjZXMiLCJzb21lIiwidHJhY2UiLCJtYXRjaGVzVXNlck5ldHdvcmsiLCJ1c2VyTmV0d29ya0ZpbHRlciIsInVzZXJfbmFtZSIsIm1hdGNoZXNFZGdlIiwiZWRnZXMiLCJlZGdlIiwidGFyZ2V0SWQiLCJtYXRjaGVzRW50aXR5VHlwZSIsImVudGl0eVR5cGUiLCJBcnJheSIsImlzQXJyYXkiLCJtYXRjaGVzRWRnZVR5cGUiLCJlZGdlVHlwZSIsIm1hdGNoZXNNaWdyYXRpb25SZWFzb25zIiwibWlncmF0aW9uUmVhc29ucyIsInJlYXNvbiIsIm1hdGNoZXNTZWxlY3RlZE1pZ3JhdGlvbk5ldHdvcmtzIiwic2VsZWN0ZWRNaWdyYXRpb25OZXR3b3JrSWRzIiwiaWQiLCJtYXRjaGVzIiwicHVzaCIsIk1hdGgiLCJjZWlsIiwicGVyY2VudCIsInJvdW5kIiwiY2FsY3VsYXRlQ2VudHJhbGl0eSIsImZpbHRlcmVkTmV0d29ya3MiLCJjZW50cmFsaXR5VHlwZSIsImNlbnRyYWxpdHkiLCJvbm1lc3NhZ2UiLCJlIiwiZGF0YSIsInJlc3VsdCJdLCJpZ25vcmVMaXN0IjpbXSwic291cmNlUm9vdCI6IiJ9\n//# sourceURL=webpack-internal:///(pages-dir-browser)/./src/workers/networkWorker.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "static/webpack/" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("static/webpack/" + __webpack_require__.h() + ".4c1b97b1368fb116.hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("eb1757bd0a38e9f8")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script),
/******/ 					createScriptURL: (url) => (url)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script url */
/******/ 	(() => {
/******/ 		__webpack_require__.tu = (url) => (__webpack_require__.tt().createScriptURL(url));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId, fetchPriority) {
/******/ 				return trackBlockingPromise(require.e(chunkId, fetchPriority));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				// inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results).then(function () {});
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							}, [])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								}
/******/ 								return setStatus("ready").then(function () {
/******/ 									return updatedModules;
/******/ 								});
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/_next/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = __webpack_require__.hmrS_importScripts = __webpack_require__.hmrS_importScripts || {
/******/ 			"_pages-dir-browser_src_workers_networkWorker_js": 1
/******/ 		};
/******/ 		
/******/ 		// no chunk install function needed
/******/ 		// no chunk loading
/******/ 		
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			var success = false;
/******/ 			self["webpackHotUpdate_N_E"] = (_, moreModules, runtime) => {
/******/ 				for(var moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						currentUpdate[moduleId] = moreModules[moduleId];
/******/ 						if(updatedModulesList) updatedModulesList.push(moduleId);
/******/ 					}
/******/ 				}
/******/ 				if(runtime) currentUpdateRuntime.push(runtime);
/******/ 				success = true;
/******/ 			};
/******/ 			// start update chunk loading
/******/ 			importScripts(__webpack_require__.tu(__webpack_require__.p + __webpack_require__.hu(chunkId)));
/******/ 			if(!success) throw new Error("Loading update chunk failed for unknown reason");
/******/ 		}
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.importScriptsHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result = newModuleFactory
/******/ 						? getAffectedModuleEffects(moduleId)
/******/ 						: {
/******/ 								type: "disposed",
/******/ 								moduleId: moduleId
/******/ 							};
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err1) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err1,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err1);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.importScripts = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.importScripts = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.importScriptsHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__("(pages-dir-browser)/./src/workers/networkWorker.js");
/******/ 	_N_E = __webpack_exports__;
/******/ 	
/******/ })()
;