#include <iostream>
#include <fstream>

int main(int argc, char** argv) {
    if (argc < 3) {
        std::cerr << "usage: triune-cpu --model <path> --prompt <text>" << std::endl;
        return 1;
    }
    std::string model_path;
    std::string prompt;
    for (int i = 1; i < argc; ++i) {
        std::string arg = argv[i];
        if (arg == "--model" && i + 1 < argc) {
            model_path = argv[++i];
        } else if (arg == "--prompt" && i + 1 < argc) {
            prompt = argv[++i];
        }
    }
    if (model_path.empty()) {
        std::cerr << "missing --model" << std::endl;
        return 1;
    }
    std::ifstream file(model_path);
    if (!file.good()) {
        std::cerr << "failed to open model: " << model_path << std::endl;
        return 1;
    }
    std::string first_line;
    std::getline(file, first_line);
    std::cout << "Loaded model artifact from " << model_path << std::endl;
    std::cout << "Prompt: " << prompt << std::endl;
    std::cout << "(stubbed response)" << std::endl;
    return 0;
}
