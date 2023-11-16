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
CIR=[] #global
########################


app = Flask(__name__)
app.config['DEBUG'] = True
CORS(app, resources={r'*': {'origins': 'http://localhost:3000'}}, supports_credentials=True)

# Write your own data file path
path = "C:/Users/ASUS/Desktop/InfoVis/Project/awsvs/src/data/"

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

    return jsonify({'result': CIR})



def temp_Get_Data(local_CIR):
    GlobalCIR = CIR
    if len(CIR) == 0:
        return GetMeasurement_mag(type="Ipatov",env="NLOS") #only test
    else:
        return CIR







@app.route('/get')
def get_data():

    #### argument format ######
    # param1: reserved
    # param2: reserved
    # param3: reserved
    # param4: processing method [Raw, SG, CWT, STFT, PCA]
    # param5: hyperparams1 for processing method
    # param6: hyperparams2 for processing method

    param1 = request.args.get('param1')
    param2 = request.args.get('param2')
    param3 = request.args.get('param3')
    param4 = request.args.get('param4')
    param5 = request.args.get('param5')
    param6 = request.args.get('param6')
    print("argument check")
    print(param1,param2,param3,param4,param5)


    #parse
    processing_method = param4


    if(processing_method=='Raw'):
        resultData = temp_Get_Data()
    elif(processing_method=='SG'):
        pass
    elif(processing_method=='CWT'):
        pass
    elif(processing_method=='STFT'):
        pass
    elif(processing_method=='STFT'):
        pass
    else:
        print("Not availiable of processing_method")
    
    return jsonify(resultData)

    # if (param1=='all_type') and (param1=='all_type'):

    #     IpatovCirAmp = GetMeasurement_mag("Ipatov","NLOS") #mandatory
    #     Sts1CirAmp   = GetMeasurement_mag("STS1","NLOS")  #optional
    #     Sts2CirAmp   = GetMeasurement_mag("STS2","NLOS")  #optional

    #     IpatovCirAmp2 = GetMeasurement_mag("Ipatov","LOS") #mandatory
    #     Sts1CirAmp2   = GetMeasurement_mag("STS1","LOS")  #optional
    #     Sts2CirAmp2   = GetMeasurement_mag("STS2","LOS")  #optional

    #     InputData = np.vstack((IpatovCirAmp, Sts1CirAmp, Sts2CirAmp, IpatovCirAmp2, Sts1CirAmp2, Sts2CirAmp2)) #debug data
        
        

        # 1. raw results
        #CIR_ret = InputData
        # 2. SG filtering 
    # CIR_ret= SGfilteringPlot(Timedelayidx,temp(param1),30,11) #requires 2 params
        # 3. PCA
        #CIR_ret= PcaPlot(Timedelayidx,InputData,3) #requires 1 param
        # 4. Get CWT result, TODO, output is 3D matrix
        #CIR_ret=CwtPlot(Timedelayidx,InputData,'cgau1',12,1e-9) #

        # parse
    




    
    




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
    #       hyperparam1: windowing param, should be hyperparam1 <  hyperparam2
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


def temp(file):
    f = open(file, "r")
    reader = csv.reader(f)
    CIR =[]
    for row in reader:
        print(row)
        MeasCIR = row        
        CIR.append(float(row[0]))
    CIR = np.array(CIR)
    return CIR
    
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
    print(StackedCIR.shape)
    # CIR_ret = np.empty((StackedCIR.shape[0], StackedCIR.shape[1]))
    CIR_ret = np.empty([])
    for i in range(2):
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


    
if __name__ == '__main__':
    app.run(debug=True, port=5000)