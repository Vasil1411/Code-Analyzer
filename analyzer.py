import ast

class CodeInspector(ast.NodeVisitor):
    def __init__(self):
        self.issues = []

    def visit_FunctionDef(self, node):
        # 1. Проверка за липса на Type Hints на аргументите/връщането
        if not node.returns and node.name != "__init__":
            self.issues.append(f"Функцията '{node.name}' няма зададен тип на връщане (return type hint).")
        
        # 2. Проверка за прекалено дълги функции (Clean Code принцип)
        func_lines = node.end_lineno - node.lineno
        if func_lines > 20:
            self.issues.append(f"Функцията '{node.name}' е твърде дълга ({func_lines} реда). Разбийте я на по-малки.")

        self.generic_visit(node)

    def visit_Global(self, node):
        # 3. Намиране на използване на global променливи (лоша практика)
        self.issues.append(f"Използва се global ключова дума на ред {node.lineno}. Препоръчва се избягването й.")

def analyze_python_code(source_code: str):
    try:
        tree = ast.parse(source_code)
        inspector = CodeInspector()
        inspector.visit(tree)
        return {"success": True, "issues": inspector.issues}
    except SyntaxError as e:
        return {"success": False, "issues": [f"Синтактична грешка в кода на ред {e.lineno}: {e.msg}"]}