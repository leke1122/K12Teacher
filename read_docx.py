# -*- coding: utf-8 -*-
from docx import Document
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

doc = Document(r'C:\Users\Admin\Desktop\第一单元 从中华文明起源到秦汉统一多民族封建国家的建立与巩固 知识点清单--高中历史统编版（2019）必修中外历史纲要上册.docx')
for p in doc.paragraphs:
    if p.text.strip():
        print(p.text)
