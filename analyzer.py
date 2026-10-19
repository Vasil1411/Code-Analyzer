import ast
import re

class AdvancedCodeInspector(ast.NodeVisitor):
    def __init__(self):
        self.issues = []

    def visit_FunctionDef(self, node):
        # 1. PEP 8 Naming Convention check (snake_case)
        if not re.match(r'^[a-z_][a-z0-9_]*$', node.name) and node.name != "__init__":
            self.issues.append({
                "type": "Naming Convention (PEP 8)",
                "message": f"Function '{node.name}' should be lowercase separated by underscores (snake_case).",
                "line": node.lineno,
                "severity": "LOW"
            })

        # 2. Return Type Hint check
        if not node.returns and node.name != "__init__":
            self.issues.append({
                "type": "Missing Type Hint",
                "message": f"Function '{node.name}' is missing a return type hint.",
                "line": node.lineno,
                "severity": "LOW"
            })
        
        # 3. Function length check (> 15 lines)
        func_lines = (node.end_lineno or node.lineno) - node.lineno
        if func_lines > 15:
            self.issues.append({
                "type": "Function Too Long",
                "message": f"Function '{node.name}' is too long ({func_lines} lines). Consider refactoring.",
                "line": node.lineno,
                "severity": "MEDIUM"
            })

        # 4. Docstring check
        if not ast.get_docstring(node):
            self.issues.append({
                "type": "Missing Docstring",
                "message": f"Function '{node.name}' is missing a docstring documentation.",
                "line": node.lineno,
                "severity": "LOW"
            })

        # 5. Cyclomatic Complexity check
        complexity = 1
        for child in ast.walk(node):
            if isinstance(child, (ast.If, ast.For, ast.While, ast.ExceptHandler, ast.With)):
                complexity += 1
        
        if complexity > 5:
            self.issues.append({
                "type": "High Complexity",
                "message": f"Function '{node.name}' has high cyclomatic complexity ({complexity}). Too many branching paths.",
                "line": node.lineno,
                "severity": "HIGH"
            })

        self.generic_visit(node)

    def visit_Global(self, node):
        # 6. Global keyword usage anti-pattern
        self.issues.append({
            "type": "Global Keyword Usage",
            "message": f"Using 'global' keyword at line {node.lineno} violates clean code principles.",
            "line": node.lineno,
            "severity": "MEDIUM"
        })

    def visit_Call(self, node):
        # 7. Dangerous built-in calls
        if isinstance(node.func, ast.Name) and node.func.id in ["eval", "exec", "input"]:
            self.issues.append({
                "type": "Security Vulnerability",
                "message": f"Critical security risk: Dangerous built-in function '{node.func.id}' used at line {node.lineno}.",
                "line": node.lineno,
                "severity": "CRITICAL"
            })
        self.generic_visit(node)

    def visit_Import(self, node):
        # 8. Forbidden imports
        for alias in node.names:
            if alias.name in ["subprocess", "pickle", "telnetlib", "ftplib"]:
                self.issues.append({
                    "type": "Dangerous Import",
                    "message": f"Forbidden module '{alias.name}' imported at line {node.lineno}.",
                    "line": node.lineno,
                    "severity": "HIGH"
                })

def analyze_python_code(source_code: str):
    try:
        tree = ast.parse(source_code)
        inspector = AdvancedCodeInspector()
        inspector.visit(tree)
        return {
            "success": True, 
            "total_issues": len(inspector.issues),
            "issues": inspector.issues
        }
    except SyntaxError as e:
        return {
            "success": False, 
            "issues": [{
                "type": "Syntax Error",
                "message": f"Syntax error: {e.msg}",
                "line": e.lineno,
                "severity": "CRITICAL"
            }]
        }