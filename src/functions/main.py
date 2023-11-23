import numpy as np
import csv
from scipy.signal import savgol_filter
from scipy import signal
from sklearn.decomposition import PCA
from pywt import cwt
import sys
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os


####################### debug flag #######################
plot_flag = 0; #if standalone python 
debug_flag = 0;
##########################################################


################## fixed design params ##################
Fs =499.2e6*2;
Ts = 1/Fs;
Timedelayidx = np.arange(0,512*Ts,Ts); 
c = 299792458; # speed of light in the air, m/sec
ParseError = -1;
CIR=[] #global data
##########################################################


app = Flask(__name__)
app.config['DEBUG'] = True
CORS(app, resources={r'*': {'origins': 'http://localhost:3000'}}, supports_credentials=True)

# Write your own data file path
path = "C:/Users/ASUS/Desktop/InfoVis/Project/awsvs/src/data/"
# path = "/Users/hslee/Desktop/GitMUC/Test/AWSVS/src/data"

# Import Data => Python => Import Data
@app.route('/upload', methods=['POST'])
def uploadFile():
    file = request.files['file']
    
    fileName = secure_filename(file.filename)
    filePath = os.path.join(path, fileName)
    file.save(filePath)
    # print(filePath)

    # 임시 방편
    f = open(filePath, "r")
    reader = csv.reader(f)
    CIR =[]
    for row in reader:
        CIR.append(float(row[0]))
    print(CIR)

    return jsonify({'result': [CIR]})



def temp_Get_Data():
    GlobalCIR = CIR
    if len(CIR) == 0:
        return GetMeasurement_mag(type="Ipatov",env="NLOS") #only test
    else:
        return CIR


#send
@app.route('/get', methods=['POST'])
def get_data():

    #### argument format ######
    # param1: reserved
    # param2: reserved
    # param3: reserved
    # param4: processing method [Raw, SG, CWT, STFT, PCA]
    # param5: hyperparams1 for processing method
    # param6: hyperparams2 for processing method

    # param1 = request.args.get('param1')
    # param2 = request.args.get('param2')
    # param3 = request.args.get('param3')
    # param4 = request.args.get('param4')
    # param5 = request.args.get('param5')
    # param6 = request.args.get('param6')

    # print("#### Debug:: argument check ####")
    # print(param1,param2,param3,param4,param5,param6)

    #############################################
    ### New Fetch Method
    #############################################
    data = np.array(json.loads(request.form['data']))
    # data = np.array(temp_Get_Data()) #get measurement
    # print(data)

    processInfo = json.loads(request.form['processing'])
    # print(processInfo)
    print("applySignalDenoising :", processInfo['applySignalDenoising'])
    print("window :", processInfo['window'])
    print("degreeOfPolynomial :", processInfo['degreeOfPolynomial'])
    print("applySTFT :", processInfo['applySTFT'])
    print("applyCWT :", processInfo['applyCWT'])
    print("wavelet :", processInfo['wavelet'])
    print("scale :", processInfo['scale'])
    print("- "* 20, end="\n")

    # Determine Processing Method
    resultData=[]
    isSG = processInfo['applySignalDenoising']
    isCWT = processInfo['applyCWT']
    isSTFT = processInfo['applySTFT']

    if len(data) > 100: # if 1D array
        data = data.reshape((1, -1)) 

    if not isSG and not isCWT and not isSTFT:
        print("Raw")
        resultData = data
        print("Size of raw result is",np.shape(data))
    elif not isSG and not isCWT:
        print("Only STFT")
        # TO DO (STFT)
        print("To be implemented")
    elif not isSG and not isSTFT:
        print("Only CWT")
        Wavelet = processInfo['wavelet']
        Scale = processInfo['scale']
        resultData, _ = CwtPlot(Timedelayidx,data,Wavelet,Scale)
        resultData = np.squeeze(abs(resultData), axis=1)
        print("spectogram dimension is")
        print("Size of CWT return reulst is",np.shape(resultData))
    elif not isCWT and not isSTFT:
        print("Only SG")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        resultData = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)
    elif not isCWT:
        print("SG & STFT")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        fromSG = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)
        # TO DO (STFT)
        print("To be implemented")
    elif not isSTFT:
        print("SG & CWT")
        # Parse Hyperparameters
        Window = processInfo['window']
        DegreeOfPolynomial = processInfo['degreeOfPolynomial']
        fromSG = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)
        Wavelet = processInfo['wavelet']
        Scale = processInfo['scale']
        resultData, _ = CwtPlot(Timedelayidx,fromSG,Wavelet,Scale)
        resultData = np.squeeze(abs(resultData), axis=1)
        print("spectogram dimension is")
        print("Size of CWT return reulst is",np.shape(resultData))

    ###### TODO ######
    # example
    #[windowed_timedomain_signal,FT_result]=WindowingFT(denoisedSignalviaFilter,100,512) 
    ###### TODO end ######

    result = resultData.tolist()
    return jsonify({'result': result}) # 1D, 2D array ~

    # if len(data) > 100: #if 1D array
    #     data = data.reshape((1, -1)) 

    # #processing
    # if(processing_method=='Raw'):
    #     resultData = data

    # elif(processing_method=='SG'):
    #     #parse hyperparameters
    #     Window = processInfo['window']
    #     DegreeOfPolynomial = processInfo['degreeOfPolynomial']
    #     # get result
    #     resultData = SGfilteringPlot(Timedelayidx,data,Window,DegreeOfPolynomial)

    # elif(processing_method=='CWT'):
    #     #parse hyperparameters
    #     Wavelet = param5
    #     Scale = processInfo['scale']
    #     resultData, _ = CwtPlot(Timedelayidx,data,Wavelet,Scale)
    #     resultData = abs(resultData)
    #     print("spectogram dimension is")
    #     print("Size of CWT return reulst is",np.shape(resultData))
    #     #example Size  (12, 6, 512)
    #     # 12: depending on scale
    #     # 6: number of data
    #     # 512 a data length

    # elif(processing_method=='STFT'):
    #     pass

    # elif(processing_method=='PCA'):
    #     pass

    # else:
    #     print("Not availiable of processing_method")
    
    # result = resultData.tolist()
    # return jsonify(result) # 1D, 2D array ~



def GetCirAmplitude(CIR):
    """
    #biref:  Get amplitude from Complex data
    #input: Complex data, its length 1016 or (512)
    #output: real data , its length depend on input's length
    """
    ##TODO normalized?
    ret=abs(CIR)
    return ret


def SGfiltering(CIR_amp,hyperparam1,hyperparam2):
    """
    #brief: CIR noise filtering via Savizy Golay filter 
    #args: real data (only avaialable for amplitude CIR), its length 1016
    #       hyperparam1: windowing param, should be hyperparam1 < hyperparam2 ??? , hyperparam1 > hyperparam2
    #       hyperparam2:polynomial degree
    #output: real data , its length depend on input's length
    """
    ret = savgol_filter(CIR_amp, hyperparam1, hyperparam2)
    return ret



def scale_to_frequency_CWT(scale):
    """
    Get frequency [Hz]
    """
    return 1.0 / scale
    


def GetMeasurement_mag(type="Ipatov",env="NLOS"):
    """
    parser, TODO consider I/Q meas.
    args: 
          type: type of CIR [Ipatov,STS1,STS2]
          env: LOS and NLOS (identify data collected in diff. environments)
    """
    filename=[]
    if env == "LOS":
        filename = "LOS/";
    elif env == "NLOS":
        filename = "NLOS/"
    else:
        pass #//TODO

    if type == "Ipatov":
        filename = filename+"Ipatov_CIR.csv"
    elif type == "STS1":
        filename = filename+"STS1_CIR.csv"
    elif type == "STS2":
        filename = filename+"STS2_CIR.csv"
    else: 
        print("Error:: unvailid type")
        return -1

    f = open(filename, "r")
    reader = csv.reader(f)
    CIR =[]
    for row in reader:
        MeasCIR = row        
        CIR.append(float(row[0]))
    CIR = np.array(CIR)
    return CIR


    
def SGfilteringPlot(Timedelayidx,StackedCIR,hyperParam1=20,hyperParam2=11):
    CIR_ret = np.empty((StackedCIR.shape[0], StackedCIR.shape[1]))
    for i in range(StackedCIR.shape[0]):
        print(len(StackedCIR[i]))
        result =  SGfiltering(StackedCIR[i],hyperParam1,hyperParam2)
        CIR_ret[i]  = result
    print("Size of SGfilter result is",np.shape(CIR_ret))
    return CIR_ret
    

    

def PcaPlot(Timedelayidx,StackedCir,NumPC=2):
    if NumPC > StackedCir.shape[0]:
        print("Not support (yet)")
        NumPC=StackedCir.shape[0]


    mean_centered_data = StackedCir - np.mean(StackedCir, axis=1)[:, np.newaxis] # subtract mean
    cov_matrix = np.cov(mean_centered_data)
    eigenvalues, eigenvectors = np.linalg.eig(cov_matrix)

    # Sort eigenvalue(s) ​​in descending order
    sorted_indices = np.argsort(eigenvalues)[::-1]
    eigenvalues = eigenvalues[sorted_indices]
    eigenvectors = eigenvectors[:, sorted_indices]

    # select PCs
    num_principal_components = NumPC   #   1~  # of features
    principal_components = eigenvectors[:, :num_principal_components]

    # prjoection
    projected_data = np.dot(principal_components.T, mean_centered_data)

    return projected_data
    

def CwtPlot(Timedelayidx,StackedCIR,wavelet_name='cgau1',numScales=12): #scaling = 32
    """
    args: Timedelayidx: TODO
          IpatovCirAmp,Sts1CirAmp,Sts2CirAmp: input data 

          wavelet_name: wavelet_function, available wavelet lists are ['cgau1','cmor', 'gaus1', 'mexh', 'morl','shan' ]
          numScales: The smaller this val, the better it can be helpful at detecting high frequency components of input data
          
    outputs: coeffs = (numScales, TypeofCIR, CirLength), freqs: y-axis scale
    """
    sampling_period = 1e-9 #fixed
    scales= np.arange(1, numScales+1)
    coeffs, freqs = cwt(StackedCIR, scales, wavelet=wavelet_name,sampling_period=sampling_period)
    return coeffs, freqs

def WindowingFT(data,startIdx,endIdx):
    """
    input ::
        data: UWB data
        startIdx: start windowing index, in out app, [0,512] (integer)
        endIdx: start windowing index, endIdx> startIdx (integer)
    return ::
        intervaled_signal: windowing UWB data
        abs(fft): fourier transfrom result
    """
    intervaled_signal = data[0, startIdx:endIdx]  
    num_samples = len(intervaled_signal)
    print("Debug:: widnow size is", num_samples)
    fft = np.fft.fft(intervaled_signal) / num_samples #num_samples is normalizer
    #scaleY=  abs(fft[0])/2
    fft[0] = 0 #dc offset compenstation
    fft = np.fft.fftshift(fft) #align for 0Hz 

    return intervaled_signal,abs(fft)  #time domain(only windowed), freq domian

    

    
if __name__ == '__main__':
    app.run(debug=True, port=5000)