#!/bin/bash
cd "e:/高中自学"

# Core files
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/components/ui/AutoHideHeader.tsx" ubuntu@111.229.29.77:/tmp/AutoHideHeader.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/components/layout/MainLayout.tsx" ubuntu@111.229.29.77:/tmp/MainLayout.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/layout.tsx" ubuntu@111.229.29.77:/tmp/layout_main.tsx

# Learn pages
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/page.tsx" ubuntu@111.229.29.77:/tmp/learn_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/math/function/page.tsx" ubuntu@111.229.29.77:/tmp/math_function_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/math/conclusions/page.tsx" ubuntu@111.229.29.77:/tmp/math_conclusions_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/geography/practice/[chapterId]/page.tsx" ubuntu@111.229.29.77:/tmp/geog_practice_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/geography/knowledge/[chapterId]/page.tsx" ubuntu@111.229.29.77:/tmp/geog_knowledge_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/geography/knowledge-full/[chapterId]/page.tsx" ubuntu@111.229.29.77:/tmp/geog_knowledge_full_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/history/knowledge/[chapterId]/page.tsx" ubuntu@111.229.29.77:/tmp/history_knowledge_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/politics/knowledge/[chapterId]/page.tsx" ubuntu@111.229.29.77:/tmp/politics_knowledge_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/chinese/poetry/page.tsx" ubuntu@111.229.29.77:/tmp/chinese_poetry_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/chinese/classical/page.tsx" ubuntu@111.229.29.77:/tmp/chinese_classical_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/chinese/language/page.tsx" ubuntu@111.229.29.77:/tmp/chinese_language_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/english/listening/page.tsx" ubuntu@111.229.29.77:/tmp/english_listening_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/math/visualize/[conceptId]/page.tsx" ubuntu@111.229.29.77:/tmp/math_visualize_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/math/function/practice/page.tsx" ubuntu@111.229.29.77:/tmp/math_function_practice_page.tsx
scp -i "C:/Users/Admin/Desktop/lekey.pem" "src/app/(main)/learn/textbook/[subjectId]/[chapterId]/[sectionId]/page.tsx" ubuntu@111.229.29.77:/tmp/textbook_page.tsx

# Copy to server
ssh -i "C:/Users/Admin/Desktop/lekey.pem" ubuntu@111.229.29.77 << 'ENDSSH'
cp /tmp/AutoHideHeader.tsx ~/gaozhong/src/components/ui/
cp /tmp/MainLayout.tsx ~/gaozhong/src/components/layout/
cp /tmp/layout_main.tsx ~/gaozhong/src/app/'(main)'/layout.tsx
cp /tmp/learn_page.tsx ~/gaozhong/src/app/'(main)'/learn/page.tsx
cp /tmp/math_function_page.tsx ~/gaozhong/src/app/'(main)'/learn/math/function/page.tsx
cp /tmp/math_conclusions_page.tsx ~/gaozhong/src/app/'(main)'/learn/math/conclusions/page.tsx
cp /tmp/geog_practice_page.tsx ~/gaozhong/src/app/'(main)'/learn/geography/practice/'[chapterId]'/page.tsx
cp /tmp/geog_knowledge_page.tsx ~/gaozhong/src/app/'(main)'/learn/geography/knowledge/'[chapterId]'/page.tsx
cp /tmp/geog_knowledge_full_page.tsx ~/gaozhong/src/app/'(main)'/learn/geography/knowledge-full/'[chapterId]'/page.tsx
cp /tmp/history_knowledge_page.tsx ~/gaozhong/src/app/'(main)'/learn/history/knowledge/'[chapterId]'/page.tsx
cp /tmp/politics_knowledge_page.tsx ~/gaozhong/src/app/'(main)'/learn/politics/knowledge/'[chapterId]'/page.tsx
cp /tmp/chinese_poetry_page.tsx ~/gaozhong/src/app/'(main)'/learn/chinese/poetry/page.tsx
cp /tmp/chinese_classical_page.tsx ~/gaozhong/src/app/'(main)'/learn/chinese/classical/page.tsx
cp /tmp/chinese_language_page.tsx ~/gaozhong/src/app/'(main)'/learn/chinese/language/page.tsx
cp /tmp/english_listening_page.tsx ~/gaozhong/src/app/'(main)'/learn/english/listening/page.tsx
cp /tmp/math_visualize_page.tsx ~/gaozhong/src/app/'(main)'/learn/math/visualize/'[conceptId]'/page.tsx
cp /tmp/math_function_practice_page.tsx ~/gaozhong/src/app/'(main)'/learn/math/function/practice/page.tsx
cp /tmp/textbook_page.tsx ~/gaozhong/src/app/'(main)'/learn/textbook/'[subjectId]'/'[chapterId]'/'[sectionId]'/page.tsx
ENDSSH

echo "Done!"
