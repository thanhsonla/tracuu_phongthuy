import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { BookOpen, Database, Folder, FolderOpen, FileText, File, Plus, Search, Upload, PlusSquare, Home, MapPin, Trash2, RefreshCw, X, ChevronRight, ChevronDown, Clock } from 'lucide-react';

// ===== HUYỀN KHÔNG CÁC =====
const TreeNode = ({ node, level, selectedPath, onSelect, expandedFolders, toggleFolder, onDelete, isAdmin }) => {
  const isFolder = node.type === 'folder';
  const isExpanded = expandedFolders.has(node.path);
  const isSelected = selectedPath === node.path;

  return (
    <div className="w-full">
      <div 
        onClick={() => isFolder ? toggleFolder(node.path) : onSelect(node)}
        className={`flex items-center gap-2 py-1.5 px-2 rounded-lg cursor-pointer transition-colors text-sm group/item
          ${isSelected ? 'bg-indigo-100 text-indigo-700 font-bold' : 'hover:bg-slate-100 text-slate-700'}
        `}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isExpanded ? <ChevronDown size={14} className="text-slate-400" /> : <ChevronRight size={14} className="text-slate-400" />}
            {isExpanded ? <FolderOpen size={16} className="text-amber-500" /> : <Folder size={16} className="text-amber-500" />}
            <span className="font-bold flex-1 truncate">{node.name}</span>
          </>
        ) : (
          <>
            <div className="w-3.5" />{/* Spacer for alignment without chevron */}
            <FileText size={14} className="text-indigo-400" />
            <span className="flex-1 truncate">{node.name.replace('.md', '')}</span>
          </>
        )}
        
        {isAdmin && (
           <button onClick={(e) => onDelete(node.path, isFolder, e)} 
              className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-red-500 transition p-1 rounded hover:bg-red-50 flex-shrink-0" title="Xóa">
              <Trash2 size={14}/>
           </button>
        )}
      </div>
      
      {isFolder && isExpanded && node.children && (
        <div className="mt-0.5">
          {node.children.map((child, idx) => (
            <TreeNode key={idx} node={child} level={level + 1} selectedPath={selectedPath} 
                      onSelect={onSelect} expandedFolders={expandedFolders} toggleFolder={toggleFolder} onDelete={onDelete} isAdmin={isAdmin} />
          ))}
        </div>
      )}
    </div>
  );
};

const HuyenKhongCac = ({ currentUser }) => {
  const isAdmin = currentUser?.role === 'ADMIN';
  const [tree, setTree] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [searchText, setSearchText] = useState('');
  
  // Modals state
  const [modalType, setModalType] = useState(null); // 'upload', 'folder', 'write'
  const [targetFolder, setTargetFolder] = useState('');
  
  const [folderName, setFolderName] = useState('');
  const [textFileName, setTextFileName] = useState('');
  const [textContent, setTextContent] = useState('');
  const [uploadFiles, setUploadFiles] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchTree = async () => {
    try {
      const res = await fetch('/api/docs/list');
      const data = await res.json();
      setTree(data);
    } catch (e) { console.error('Fetch tree error:', e); }
  };

  useEffect(() => { fetchTree(); }, []);

  const handleSelect = async (node) => {
    if (node.type === 'file') {
      setSelectedFile(node);
      try {
        const res = await fetch(`/api/docs/content?path=${encodeURIComponent(node.path)}`);
        const text = await res.text();
        setFileContent(text);
      } catch (e) {
        setFileContent('Lỗi khi tải file.');
      }
    }
  };

  const toggleFolder = (path) => {
    const next = new Set(expandedFolders);
    if (next.has(path)) next.delete(path);
    else next.add(path);
    setExpandedFolders(next);
  };

  const getAllFolders = (nodes, currentList = []) => {
    for (const node of nodes) {
      if (node.type === 'folder') {
        currentList.push(node.path);
        getAllFolders(node.children, currentList);
      }
    }
    return currentList;
  };
  const availableFolders = ['', ...getAllFolders(tree)]; // '' is Root

  const filterTree = (nodes, query) => {
    if (!query) return nodes;
    const lowerQuery = query.toLowerCase();
    
    return nodes.reduce((acc, node) => {
      const matchName = node.name.toLowerCase().includes(lowerQuery);
      
      if (node.type === 'folder') {
         const filteredChildren = filterTree(node.children || [], query);
         if (matchName || filteredChildren.length > 0) {
            acc.push({ ...node, children: filteredChildren });
         }
      } else {
         if (matchName) acc.push(node);
      }
      return acc;
    }, []);
  };
  
  const displayTree = filterTree(tree, searchText);

  // ---- API ACTIONS ----
  const handleCreateFolder = async () => {
    if(!folderName) return;
    const body = { folderPath: targetFolder ? `${targetFolder}/${folderName}` : folderName };
    await fetch('/api/docs/create-folder', { method: 'POST', body: JSON.stringify(body) });
    setModalType(null); setFolderName(''); fetchTree();
  };

  const handleSaveText = async () => {
    if(!textFileName || !textContent) return;
    const name = textFileName.endsWith('.md') ? textFileName : `${textFileName}.md`;
    const fPath = targetFolder ? `${targetFolder}/${name}` : name;
    await fetch('/api/docs/save-text', { method: 'POST', body: JSON.stringify({ filePath: fPath, content: textContent }) });
    setModalType(null); setTextFileName(''); setTextContent(''); fetchTree();
  };

  const handleUpdateText = async () => {
    if(!textContent || !selectedFile) return;
    await fetch('/api/docs/save-text', { method: 'POST', body: JSON.stringify({ filePath: selectedFile.path, content: textContent }) });
    setModalType(null); 
    setFileContent(textContent);
    fetchTree();
  };

  const handleDeleteItem = async (itemPath, isFolder = false, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Bạn có chắc muốn xóa ${isFolder ? 'thư mục' : 'file'}:\n${itemPath}?`)) return;
    
    await fetch('/api/docs/delete', { method: 'POST', body: JSON.stringify({ itemPath }) });
    
    if (!isFolder && selectedFile?.path === itemPath) {
       setSelectedFile(null);
       setFileContent('');
    }
    fetchTree();
  };

  const handleUpload = async () => {
    if(!uploadFiles || uploadFiles.length === 0) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('folder', targetFolder);
    for (let i=0; i<uploadFiles.length; i++) { formData.append('files', uploadFiles[i]); }
    
    try {
      await fetch('/api/docs/upload', { method: 'POST', body: formData });
      setModalType(null); setUploadFiles(null); fetchTree();
    } catch (e) { alert('Upload lỗi: ' + e.message); }
    setUploading(false);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 animate-slide-up h-[75vh]">
      
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-black text-slate-700 flex items-center gap-2"><BookOpen size={18} className="text-indigo-500"/> Tài Liệu</h3>
          <button onClick={fetchTree} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Làm mới"><RefreshCw size={14}/></button>
        </div>
        <div className="p-3 border-b border-slate-100 bg-white">
           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input type="text" value={searchText} onChange={e => {
                  setSearchText(e.target.value);
                  if (e.target.value) {
                     // Tự động mở rộng tất cả thư mục nếu gõ search
                     const allFolders = new Set(getAllFolders(tree));
                     setExpandedFolders(allFolders);
                  }
              }} placeholder="Tìm kiếm tài liệu..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-indigo-500 transition-colors" />
           </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3">
          {displayTree.length === 0 ? <p className="text-xs text-slate-400 text-center py-4">Chưa có tài liệu.</p> : null}
          {displayTree.map((node, idx) => (
            <TreeNode key={idx} node={node} level={0} selectedPath={selectedFile?.path} onSelect={handleSelect} expandedFolders={expandedFolders} toggleFolder={toggleFolder} onDelete={handleDeleteItem} isAdmin={isAdmin} />
          ))}
        </div>

        {currentUser && (
          <div className="p-3 border-t border-slate-100 bg-slate-50 grid grid-cols-3 gap-1">
            <button onClick={() => setModalType('folder')} className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition" title="Thư mục mới"><Folder size={18}/><span className="text-xs font-bold mt-1">Thư mục</span></button>
            <button onClick={() => setModalType('upload')} className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition" title="Tải file lên"><Upload size={18}/><span className="text-xs font-bold mt-1">Tải File</span></button>
            <button onClick={() => setModalType('write')} className="flex flex-col items-center justify-center p-2 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition" title="Viết bài mới"><PlusSquare size={18}/><span className="text-xs font-bold mt-1">Viết bài</span></button>
          </div>
        )}
      </div>

      {/* MAIN VIEW */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {selectedFile ? (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                 <h2 className="text-xl font-black text-slate-800">{selectedFile.name.replace('.md','')}</h2>
                 <span className="text-xs font-mono text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-md mt-1 inline-block">{selectedFile.path}</span>
              </div>
              <div className="flex gap-2">
                 {currentUser && (
                   <button onClick={() => { setTextContent(fileContent); setModalType('edit'); }} className="px-3 py-1.5 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg text-sm font-bold transition flex items-center gap-1"><FileText size={14}/> Sửa</button>
                 )}
                 {isAdmin && (
                   <button onClick={() => handleDeleteItem(selectedFile.path, false)} className="px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-bold transition flex items-center gap-1"><Trash2 size={14}/> Xóa</button>
                 )}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 md:p-10 prose prose-slate max-w-none
              prose-headings:font-black prose-headings:text-slate-800 prose-h1:text-3xl prose-h2:text-xl prose-h2:border-b prose-h2:border-slate-200 prose-h2:pb-2
              prose-code:bg-slate-100 prose-code:text-indigo-700 prose-code:px-1 prose-code:rounded
              prose-pre:bg-slate-900 prose-pre:text-slate-100 prose-blockquote:border-indigo-400 prose-blockquote:bg-indigo-50/40">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{fileContent}</ReactMarkdown>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <BookOpen size={64} className="mb-4 opacity-20" />
            <p className="text-lg font-bold">Chọn tài liệu từ danh sách để đọc</p>
            <p className="text-sm mt-1">Hoặc thêm tài liệu mới vào hệ thống</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {modalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-slide-up">
            <button onClick={() => setModalType(null)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 rounded-full p-2 hover:bg-slate-100 transition"><X size={20}/></button>
            <h3 className="text-xl font-black text-slate-800 mb-4 border-b pb-3 flex items-center gap-2">
              {modalType === 'folder' && <><Folder className="text-amber-500"/> Tạo Thư Mục Mới</>}
              {modalType === 'upload' && <><Upload className="text-blue-500"/> Tải Lên Tài Liệu (.md, .docx)</>}
              {modalType === 'write'  && <><FileText className="text-emerald-500"/> Soạn Bài Viết Mới</>}
              {modalType === 'edit'  && <><FileText className="text-indigo-500"/> Chỉnh Sửa Bài Viết</>}
            </h3>

            <div className="space-y-4">
              {/* Folder Selector (For all except Edit) */}
              {modalType !== 'edit' && (
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase">Lưu vào thư mục</label>
                <select value={targetFolder} onChange={e => setTargetFolder(e.target.value)} className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500">
                  <option value="">(Thư mục gốc)</option>
                  {availableFolders.filter(x=>x).map(f => <option key={f} value={f}>/{f}</option>)}
                </select>
              </div>
              )}

              {modalType === 'folder' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Tên Thư mục (có thể viết Tiếng Việt có dấu)</label>
                  <input type="text" value={folderName} onChange={e => setFolderName(e.target.value)} placeholder="Ví dụ: Kiến Thức Cơ Bản" className="w-full mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-amber-500" />
                  <button onClick={handleCreateFolder} className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-white font-black py-3 rounded-xl transition shadow-md">Tạo Thư Mục</button>
                </div>
              )}

              {modalType === 'upload' && (
                <div>
                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center bg-slate-50 relative hover:border-blue-400 transition">
                    <input type="file" multiple accept=".md,.doc,.docx,.txt" onChange={e => setUploadFiles(e.target.files)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                    <Upload size={32} className="mx-auto text-blue-400 mb-2"/>
                    <p className="font-bold text-slate-700 line-clamp-2">
                       {uploadFiles && uploadFiles.length > 0 ? Array.from(uploadFiles).map(f=>f.name).join(', ') : 'Kéo thả hoặc nhấp để chọn file'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Hỗ trợ: Markdown (.md), Word (.docx)</p>
                  </div>
                  <button onClick={handleUpload} disabled={uploading} className="w-full mt-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black py-3 rounded-xl transition shadow-md">
                    {uploading ? 'Đang tải lên và phân tích...' : 'Bắt Đầu Tải Lên'}
                  </button>
                </div>
              )}

              {modalType === 'write' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Tên Bài (có thể viết Tiếng Việt có dấu, VD: Bài Viết 1)</label>
                  <input type="text" value={textFileName} onChange={e => setTextFileName(e.target.value)} placeholder="Ví dụ: Huyền Không Cơ Bản" className="w-full mt-1 mb-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-emerald-500" />
                  
                  <label className="text-xs font-bold text-slate-500 uppercase">Nội dung (Hỗ trợ Markdown)</label>
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)} placeholder="# Tiêu đề chính&#10;&#10;Nội dung ở đây..." className="w-full h-48 mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:border-emerald-500 font-mono text-sm" />

                  <button onClick={handleSaveText} className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-xl transition shadow-md">Lưu Bài Viết</button>
                </div>
              )}

              {modalType === 'edit' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase">Đang chỉnh sửa bài: {selectedFile?.name}</label>
                  <div className="text-sm mt-1 mb-4 text-slate-600 font-mono bg-slate-100 p-2 rounded-xl border border-slate-200 shadow-inner">{selectedFile?.path}</div>
                  
                  <label className="text-xs font-bold text-slate-500 uppercase">Nội dung (Hỗ trợ Markdown)</label>
                  <textarea value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full h-80 mt-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none outline-none focus:border-indigo-500 font-mono text-sm" />

                  <button onClick={handleUpdateText} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 rounded-xl transition shadow-md">Cập Nhật Bài Viết</button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ===== DATABASE (HỒ SƠ DỰ ÁN) =====
export const DatabaseView = ({ projects, setProjects, setCurrentProject, setMainView, currentUser }) => {
  const [search, setSearch] = useState('');
  const isAdmin = currentUser?.role === 'ADMIN';

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (window.confirm('Bạn có chắc muốn xóa dự án này?')) {
      try {
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
      } catch (err) {
        console.error('Lỗi xóa dự án:', err);
      }
    }
  };

  const handleOpen = (project) => {
    setCurrentProject(project);
    setMainView('RESULT');
  };

  const filteredProjects = projects.filter(p => 
      !search || 
      (p.projectName && p.projectName.toLowerCase().includes(search.toLowerCase())) ||
      (p.clientName && p.clientName.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <Database className="text-emerald-600" /> Hồ Sơ Dự Án
          </h2>
          <p className="text-slate-500 text-sm mt-1">Hồ sơ các công trình đã lập tinh bàn.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
             <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
             <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm khách hàng hoặc dự án..." className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-emerald-500 transition-colors shadow-sm" />
          </div>
          <span className="bg-slate-100 border border-slate-200 text-slate-600 px-4 py-2.5 rounded-xl font-bold text-sm shrink-0">
            {filteredProjects.length} dự án
          </span>
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 flex flex-col items-center justify-center text-slate-400">
          <FolderOpen size={56} className="mb-4 opacity-30" />
          <p className="font-bold text-lg">Không tìm thấy dự án nào phù hợp.</p>
          <p className="text-sm mt-1">Hãy thử bằng từ khóa khác!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(p => (
            <div key={p.id} onClick={() => handleOpen(p)}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-emerald-400 hover:shadow-lg transition-all cursor-pointer group relative">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                <Home size={24} />
              </div>
              {(isAdmin || (currentUser && p.owner_id === currentUser.id)) && (
                <button onClick={(e) => handleDelete(p.id, e)}
                  title="Xóa dự án"
                  className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100 cursor-pointer z-10">
                  <Trash2 size={16} />
                </button>
              )}
              <h3 className="text-xl font-black text-slate-800 line-clamp-1 pr-6" title={p.projectName || p.clientName}>{p.projectName || p.clientName}</h3>
              <p className="text-sm font-bold text-slate-400 mb-1 truncate">Gia chủ: {p.clientName}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1 mt-1.5 mb-2 line-clamp-1">
                <MapPin size={13} /> {p.address || 'Chưa cập nhật địa chỉ'}
              </p>
              
              {Array.isArray(p.notes) && p.notes.length > 0 && p.notes[p.notes.length - 1]?.date ? (
                 <p className="text-xs text-indigo-500 flex items-center gap-1 mb-4 font-bold bg-indigo-50 w-fit px-2 py-1 rounded-md">
                    <Clock size={12} /> Lịch sử: {new Date(p.notes[p.notes.length - 1].date).toLocaleDateString('vi-VN')}
                 </p>
              ) : (
                 <p className="text-[11px] text-slate-400 italic mb-4 mt-2">Chưa có lịch sử chăm sóc.</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-slate-200">Vận {p.period}</span>
                <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-lg text-xs font-bold border border-red-100">{p.degree}° Hướng</span>
                <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-100">Cung {p.menhQuai}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ===== LIBRARY (WRAPPER) =====
const Library = ({ projects, setProjects, setCurrentProject, setMainView, currentUser }) => {
  const [activeTab, setActiveTab] = useState('khac'); // 'khac' | 'database'

  const tabs = [
    { id: 'khac',     label: 'Huyền Không Các', icon: BookOpen,  color: 'indigo' },
    { id: 'database', label: 'Hồ Sơ Dự Án',          icon: Database,  color: 'emerald' },
  ];

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm w-fit">
        {tabs.map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer
                ${isActive
                  ? t.color === 'indigo' ? 'bg-indigo-600 text-white shadow-md' : 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}>
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'khac'     && <HuyenKhongCac currentUser={currentUser} />}
      {activeTab === 'database' && (
        <DatabaseView
          projects={projects}
          setProjects={setProjects}
          setCurrentProject={setCurrentProject}
          setMainView={setMainView}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

export default Library;
